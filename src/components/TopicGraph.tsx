import CytoscapeComponent from 'react-cytoscapejs';
import type {
  StylesheetStyle,
  StylesheetCSS,
  Core,
  EventObjectNode,
  CollectionReturnValue,
} from 'cytoscape';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Topic } from '../types';
import { deriveDepthDelta, depthDeltaMessage } from '../utils/depth';

const pastelPalette = {
  background: '#fde6ff',
  border: '#f8c2e3',
  mastered: '#a5f5dc',
  stable: '#ffe5a7',
  progress: '#ffbadb',
  default: '#d3d9ff',
};

const clampValue = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

type TopicGraphProps = {
  topics: Topic[];
  highlightedIds: Set<string>;
  focusedTopicId?: string | null;
  onSelectTopic?: (topicId: string) => void;
  searchTerm?: string;
};

type TooltipState = {
  visible: boolean;
  x: number;
  y: number;
  id: string;
  title: string;
  description: string;
  status: string;
  depthTarget: string;
  depthMessage: string;
};

export function TopicGraph({
  topics,
  highlightedIds,
  focusedTopicId,
  onSelectTopic,
  searchTerm = '',
}: TopicGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<Core | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    id: '',
    title: '',
    description: '',
    status: '',
    depthTarget: '',
    depthMessage: '',
  });
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);
  const expandedClusterRef = useRef<string | null>(null); // Ref to track expansion for graphData calculation without deps
  
  useEffect(() => {
    expandedClusterRef.current = expandedCluster;
  }, [expandedCluster]);

  const collapseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleCollapseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevExpandedCluster = useRef<string | null>(null);
  const pointerInsideCluster = useRef(false);
  const pointerPosition = useRef<{ x: number; y: number } | null>(null);
  const lastPointerCluster = useRef<string | null>(null);
  const pointerMoveRaf = useRef<number | null>(null);
  const pendingPointerEvent = useRef<MouseEvent | null>(null);
  const laneTracks = useMemo(() => {
    const order = Array.from(
      new Set(
        topics
          .map((topic) => topic.track?.toUpperCase() || '')
          .filter((track) => track.length > 0),
      ),
    ).sort();
    if (order.length) return order;
    const defaultOrder = ['A', 'B', 'C', 'D', 'E'];
    return defaultOrder.filter((track) =>
      topics.some((topic) => topic.track?.toUpperCase() === track),
    );
  }, [topics]);

  const trackTitles = useMemo(() => {
    const mapping = new Map<string, string>();
    for (const topic of topics) {
      if (topic.track && topic.trackTitle && !mapping.has(topic.track)) {
        mapping.set(topic.track, topic.trackTitle);
      }
    }
    return mapping;
  }, [topics]);

  const trackSpacing = 260;
  const epochSpacing = 192;
  const hoverRepelDistance = 18;
  const rippleRange = 210;
  const rippleMaxOffset = 24;
  const rippleFalloff = 1.4;
  const hoverGraceDistance = 12;
  const nodeActivationRadius = 36;
  const collapseDelayMs = 120;
  const maxEpoch = useMemo(
    () =>
      topics.reduce((max, topic) => {
        if (typeof topic.epoch === 'number') {
          return Math.max(max, topic.epoch);
        }
        return max;
      }, 0),
    [topics],
  );

  const rawHeight = (maxEpoch + 1) * epochSpacing + 260;
  const graphHeight = Math.max(460, Math.min(920, rawHeight));

  const topicById = useMemo(() => {
    const map = new Map<string, Topic>();
    for (const topic of topics) {
      map.set(topic.id, topic);
    }
    return map;
  }, [topics]);

  const neighborIds = useMemo(() => {
    if (!focusedTopicId) return new Set<string>();
    const neighbors = new Set<string>();
    const addRelated = (source: Topic) => {
      if (!source.relatedTopicIds) return;
      source.relatedTopicIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
        .forEach((id) => neighbors.add(id));
    };

    const focusedTopic = topicById.get(focusedTopicId);
    if (focusedTopic) {
      addRelated(focusedTopic);
    }
    for (const topic of topics) {
      if (!topic.relatedTopicIds) continue;
      const ids = topic.relatedTopicIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
      if (ids.includes(focusedTopicId)) {
        neighbors.add(topic.id);
      }
    }
    neighbors.delete(focusedTopicId);
    return neighbors;
  }, [focusedTopicId, topicById, topics]);

  const minZoom = 0.4;
  const maxZoom = 2.2;

  function handleZoom(factor: number) {
    const cy = cyRef.current;
    if (!cy) return;
    cy.stop(true);
    const newZoom = Math.min(
      Math.max(cy.zoom() * factor, minZoom),
      maxZoom,
    );
    cy.zoom({
      level: newZoom,
      renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
    });
  }

  const graphData = useMemo(() => {
    const clusterCenters = new Map<
      string,
      { centerX: number; centerY: number; baseRadius: number; expandedRadius: number }
    >();
    const bucketCounts = new Map<string, number>();
    topics.forEach((topic) => {
      const key = `${topic.epoch}-${topic.track}`;
      bucketCounts.set(key, (bucketCounts.get(key) ?? 0) + 1);
    });

    const bucketOffsets = new Map<string, number>();
    const topicIdSet = new Set(topics.map((topic) => topic.id));

    // Prepare search matching logic
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const isSearchActive = normalizedSearch.length > 0;
    const searchDimById = new Map<string, number>();

    const nodes = topics.map((topic) => {
      const depthMeta = deriveDepthDelta(topic);
      const epochRow = topic.epoch ?? 0;
      const trackIndex = topic.track ? laneTracks.indexOf(topic.track.toUpperCase()) : -1;
      const fallbackIndex = trackIndex >= 0 ? trackIndex : laneTracks.length;
      const centerX = fallbackIndex * trackSpacing;
      const centerY = epochRow * epochSpacing;
      const key = `${topic.epoch}-${topic.track}`;
      const processed = bucketOffsets.get(key) ?? 0;
      bucketOffsets.set(key, processed + 1);
      const total = bucketCounts.get(key) ?? 1;
      const clusterSize = total;
      const radialAngle =
        clusterSize > 1
          ? (Math.PI * 2 * processed) / clusterSize
          : 0;
      
      const radius = Math.min(62, 10 + Math.sqrt(total) * 8.2);
      
      // Dynamic expansion to ensure nodes don't overlap
      // C = 2 * pi * r => r = C / 2pi
      // We need about 80px per node (62px width + gap)
      const minCircumference = total * 80;
      const minExpansionRadius = minCircumference / (2 * Math.PI);
      const expansionDistance = Math.max(radius + 100, minExpansionRadius);

      const deltaX =
        radius * Math.cos(radialAngle || 0); 
      const deltaY = radius * Math.sin(radialAngle || 0);
      const baseX = centerX + deltaX;
      const baseY = centerY + deltaY;
      const expandedX =
        centerX + Math.cos(radialAngle || 0) * expansionDistance;
      const expandedY =
        centerY + Math.sin(radialAngle || 0) * expansionDistance;
      const holdRadius = expansionDistance + 20; 
      const baseHitRadius = radius + hoverRepelDistance; // Tight radius for initial detection
      const expandedHitRadius = holdRadius; // Large radius to keep it open

      const meta = clusterCenters.get(key);
      if (!meta || holdRadius > meta.expandedRadius) {
        clusterCenters.set(key, { centerX, centerY, baseRadius: baseHitRadius, expandedRadius: expandedHitRadius });
      }

      // Check if node matches search
      const matchesSearch =
        !isSearchActive ||
        topic.id.toLowerCase().includes(normalizedSearch) ||
        topic.topicName.toLowerCase().includes(normalizedSearch) ||
        topic.description.toLowerCase().includes(normalizedSearch);
      const searchDim = !matchesSearch ? 1 : 0;
      searchDimById.set(topic.id, searchDim);

      return {
        data: {
          id: topic.id,
          shortLabel: topic.id,
          label: topic.topicName,
          track: topic.track,
          trackTitle: topic.trackTitle,
          status: topic.status || 'Not Started',
          epoch: epochRow,
          highlight: highlightedIds.has(topic.id) ? 1 : 0,
          depthTarget: topic.depthTarget,
          description: topic.description,
          depthState: depthMeta.state,
          depthMessage: depthDeltaMessage(depthMeta),
          focus: focusedTopicId === topic.id ? 1 : 0,
          neighbor: neighborIds.has(topic.id) ? 1 : 0,
          centerX,
          centerY,
          clusterAngle: radialAngle,
          baseRadius: radius,
          clusterKey: key,
          baseX,
          baseY,
          expandedX,
          expandedY,
          searchDim, // Mark for dimming
        },
        position: {
          x: baseX,
          y: baseY,
        },
      };
    });

    const seenEdges = new Set<string>();
    const edges = topics.flatMap((topic) => {
      if (!topic.relatedTopicIds) return [];
      const relatedIds = topic.relatedTopicIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
        .filter((id) => topicIdSet.has(id));

      return relatedIds.flatMap((targetId) => {
        const canonical =
          topic.id < targetId ? `${topic.id}::${targetId}` : `${targetId}::${topic.id}`;
        if (seenEdges.has(canonical)) return [];
        seenEdges.add(canonical);
        const edgeId = `${topic.id}=>${targetId}`;
        
        // Edge is dimmed if BOTH source and target are dimmed by search
        // Or simplified: if search is active, dim edge unless both ends match?
        // Let's stick to simple logic: if a node is dimmed, edges connecting to it might be less relevant,
        // but often we want to see connections.
        // Let's dim edge if EITHER end is dimmed to reduce clutter.
        const isDimmed =
          searchDimById.get(topic.id) === 1 ||
          searchDimById.get(targetId) === 1;

        return [
          {
            data: {
              id: edgeId,
              source: topic.id,
              target: targetId,
              highlight:
                highlightedIds.has(topic.id) || highlightedIds.has(targetId)
                  ? 1
                  : 0,
              relationship:
                topicById.get(targetId)?.track === topic.track
                  ? 'same-track'
                  : 'cross-track',
              focusEdge:
                focusedTopicId &&
                (topic.id === focusedTopicId ||
                  targetId === focusedTopicId ||
                  neighborIds.has(topic.id) ||
                  neighborIds.has(targetId))
                  ? 1
                  : 0,
              searchDim: isDimmed ? 1 : 0,
            },
          },
        ];
      });
    });

    return { elements: [...nodes, ...edges], clusterCenters };
  }, [topics, highlightedIds, topicById, focusedTopicId, neighborIds, laneTracks, searchTerm]);
  const elements = graphData.elements;
  const clusterCenters = graphData.clusterCenters;
  const clusterCentersRef = useRef(clusterCenters);
  useEffect(() => {
    clusterCentersRef.current = clusterCenters;
  }, [clusterCenters]);

  function resetView() {
    const cy = cyRef.current;
    if (!cy) return;
    cy.fit(undefined, 60);
    cy.center();
  }

  const queueCollapse = useCallback(() => {
    if (collapseTimeout.current) return;
    collapseTimeout.current = setTimeout(() => {
      const currentKey = expandedClusterRef.current;
      const pointer = pointerPosition.current;
      const centers = clusterCentersRef.current;

      let shouldCollapse = !pointerInsideCluster.current;

      if (currentKey && pointer) {
        const meta = centers.get(currentKey);
        if (meta) {
          const dist = Math.hypot(
            pointer.x - meta.centerX,
            pointer.y - meta.centerY,
          );
          if (dist <= meta.expandedRadius + hoverGraceDistance) {
            shouldCollapse = false;
          }
        }
      }

      if (shouldCollapse) {
        setExpandedCluster(null);
        lastPointerCluster.current = null;
      }
      collapseTimeout.current = null;
    }, collapseDelayMs);
  }, [collapseDelayMs, hoverGraceDistance]);

  useEffect(() => {
    if (idleCollapseTimeout.current) {
      clearTimeout(idleCollapseTimeout.current);
      idleCollapseTimeout.current = null;
    }
    if (!expandedCluster) return;

    idleCollapseTimeout.current = setTimeout(() => {
      idleCollapseTimeout.current = null;
      const currentKey = expandedClusterRef.current;
      const pointer = pointerPosition.current;
      const centers = clusterCentersRef.current;
      if (!currentKey || !pointer) return;
      const meta = centers.get(currentKey);
      if (!meta) return;
      const dist = Math.hypot(
        pointer.x - meta.centerX,
        pointer.y - meta.centerY,
      );
      if (dist > meta.expandedRadius + hoverGraceDistance) {
        pointerInsideCluster.current = false;
        lastPointerCluster.current = null;
        setExpandedCluster(null);
      }
    }, collapseDelayMs);

    return () => {
      if (idleCollapseTimeout.current) {
        clearTimeout(idleCollapseTimeout.current);
        idleCollapseTimeout.current = null;
      }
    };
  }, [expandedCluster, collapseDelayMs, hoverGraceDistance]);

  const initialFitDone = useRef(false);

  useEffect(() => {
    if (initialFitDone.current) return;
    resetView();
    initialFitDone.current = true;
  }, [elements.length]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const applyRipple = (
      key: string,
      expand: boolean,
      preselected?: CollectionReturnValue,
    ) => {
      const meta = clusterCenters.get(key);
      if (!meta) return;
      const affected =
        preselected ?? cy.nodes().difference(cy.nodes(`[clusterKey = "${key}"]`));
      
      // Strict exclusion zone: The expanded cluster radius + buffer
      const safeZone = meta.expandedRadius + 60;
      const rippleFalloffZone = 200; // How far beyond safeZone the push extends
      const rippleReach = safeZone + rippleFalloffZone + 120; // Further reach to preserve ripple feel

      affected.forEach((node) => {
        const baseX = Number(node.data('baseX'));
        const baseY = Number(node.data('baseY'));
        
        if (!expand) {
          node.animate(
            { position: { x: baseX, y: baseY } },
            { duration: 220, easing: 'ease-in-out', queue: false },
          );
          return;
        }

        const dx = baseX - meta.centerX;
        const dy = baseY - meta.centerY;
        const distance = Math.hypot(dx, dy) || 1;
        
        if (distance > rippleReach) {
          return;
        }
        
        let targetX = baseX;
        let targetY = baseY;

        // If the node is within the safe zone (or close to it), push it out
        if (distance < safeZone) {
            // Hard push: Move it to the edge of safeZone, plus a little scaling factor 
            // to preserve some relative ordering of nodes that were originally deep inside
            const pushFactor = safeZone / distance;
            // Add a little extra space for deep nodes so they don't flatten perfectly onto the ring
            const extraSquish = 1.05; 
            targetX = meta.centerX + dx * pushFactor * extraSquish;
            targetY = meta.centerY + dy * pushFactor * extraSquish;
        } else if (distance < safeZone + rippleFalloffZone) {
            // Soft push: Nodes just outside get nudged so they don't bunch up against the hard-pushed ones
            const proximity = 1 - ((distance - safeZone) / rippleFalloffZone);
            const nudge = proximity * 60; // Max 60px nudge at the border
            const scale = (distance + nudge) / distance;
            targetX = meta.centerX + dx * scale;
            targetY = meta.centerY + dy * scale;
        }

        node.animate(
          { position: { x: targetX, y: targetY } },
          { duration: 300, easing: 'ease-in-out', queue: false },
        );
      });
    };

	    const animateCluster = (
	      key: string | null,
	      expand: boolean,
	      fadeNeighbors: boolean,
	    ) => {
	      if (!key) return;
	      const nodes = cy.nodes(`[clusterKey = "${key}"]`);
	      if (expand && nodes.length === 0) {
	        // If the expanded cluster no longer exists (e.g. filtered out),
	        // avoid fading everything and clear any leftover neighbor fade.
	        cy.nodes().removeClass('neighbor-repelled');
	        return;
	      }

      nodes.stop(true);
      if (expand) {
        nodes.removeClass('neighbor-repelled');
      }
      nodes.forEach((node) => {
	        const targetX = expand
	          ? Number(node.data('expandedX'))
	          : Number(node.data('baseX'));
	        const targetY = expand
	          ? Number(node.data('expandedY'))
	          : Number(node.data('baseY'));
	        if (expand) {
	          node.addClass('cluster-expanded');
	        } else {
	          node.removeClass('cluster-expanded');
	        }
	        node.animate(
	          { position: { x: targetX, y: targetY } },
	          {
	            duration: expand ? 260 : 180,
	            easing: 'ease-in-out',
	            queue: false,
	          },
	        );
	      });

	      const otherNodes = cy.nodes().difference(nodes);
	      if (fadeNeighbors) {
	        otherNodes.addClass('neighbor-repelled');
	      } else {
	        otherNodes.removeClass('neighbor-repelled');
	      }

	      if (expand) {
	        const meta = clusterCenters.get(key);
	        if (!meta) return;
	        const safeZone = meta.expandedRadius + 60;
	        const rippleFalloffZone = 200;
	        const rippleReach = safeZone + rippleFalloffZone + 120;

	        const rippleNodes = otherNodes.filter((node) => {
	          const baseX = Number(node.data('baseX'));
	          const baseY = Number(node.data('baseY'));
	          const dx = baseX - meta.centerX;
	          const dy = baseY - meta.centerY;
	          const distance = Math.hypot(dx, dy) || 1;
	          return distance <= rippleReach;
	        });

	        applyRipple(key, true, rippleNodes);
	        return;
	      }

	      applyRipple(key, false, otherNodes);
	    };

    const previous = prevExpandedCluster.current;

    // 1. Collapse the old cluster FIRST.
    // When switching directly to a new cluster, avoid unfading the new cluster's nodes
    // before their expand step, so stop() on them can't freeze opacity mid-transition.
    if (previous && previous !== expandedCluster) {
      if (expandedCluster) {
        const prevNodes = cy.nodes(`[clusterKey = "${previous}"]`);
        prevNodes.stop(true);
        prevNodes.forEach((node) => {
          const targetX = Number(node.data('baseX'));
          const targetY = Number(node.data('baseY'));
          node.removeClass('cluster-expanded');
          node.animate(
            { position: { x: targetX, y: targetY } },
            { duration: 180, easing: 'ease-in-out', queue: false },
          );
        });

        const otherNodes = cy.nodes().difference(prevNodes);
        const nextNodes = cy.nodes(`[clusterKey = "${expandedCluster}"]`);
        otherNodes.difference(nextNodes).removeClass('neighbor-repelled');
        applyRipple(previous, false, otherNodes);
      } else {
        animateCluster(previous, false, false);
      }
    }

    // 2. Open the new cluster SECOND.
    if (expandedCluster) {
      animateCluster(expandedCluster, true, true);
    }

    prevExpandedCluster.current = expandedCluster;
  }, [
    expandedCluster,
    elements,
    clusterCenters,
    rippleRange,
    rippleFalloff,
    rippleMaxOffset,
  ]);

  useEffect(() => {
    const cy = cyRef.current;
    const container = containerRef.current;
    if (!cy || !container) return;

    const getRenderer = () => {
      const rendererFactory = (cy as unknown as {
        renderer?: () => {
          projectIntoViewport?: (
            clientX: number,
            clientY: number,
          ) => [number, number];
        };
      }).renderer;
      return typeof rendererFactory === 'function'
        ? rendererFactory.call(cy)
        : undefined;
    };

    const processPointerMove = (event: MouseEvent) => {
      const renderer = getRenderer();
      let pointer = { x: 0, y: 0 };

      if (renderer?.projectIntoViewport) {
        const [x, y] = renderer.projectIntoViewport(
          event.clientX,
          event.clientY,
        );
        pointer = { x, y };
      } else {
        const rect = container.getBoundingClientRect();
        const localX = event.clientX - rect.left;
        const localY = event.clientY - rect.top;
        const zoom = cy.zoom();
        const pan = cy.pan();
        pointer = {
          x: pan.x + localX / zoom,
          y: pan.y + localY / zoom,
        };
      }
      pointerPosition.current = pointer;

      const centers = clusterCentersRef.current;
      const chooseCluster = (key: string | null) => {
        if (key) {
          pointerInsideCluster.current = true;
          if (lastPointerCluster.current !== key) {
            lastPointerCluster.current = key;
            setExpandedCluster(key);
          }
          if (collapseTimeout.current) {
            clearTimeout(collapseTimeout.current);
            collapseTimeout.current = null;
          }
        } else {
          pointerInsideCluster.current = false;
          lastPointerCluster.current = null;
          queueCollapse();
        }
      };

      // If we're still inside the currently expanded cluster's aura,
      // lock to it so repelled nodes don't "steal" focus.
      const currentKey = expandedClusterRef.current;
      if (currentKey) {
        const meta = centers.get(currentKey);
        if (meta) {
          const dist = Math.hypot(
            pointer.x - meta.centerX,
            pointer.y - meta.centerY,
          );
          if (dist <= meta.expandedRadius + hoverGraceDistance) {
            chooseCluster(currentKey);
            return;
          }
        }
      }

      let targetKey: string | null = null;
      let nearestNodeDistance = Number.POSITIVE_INFINITY;

      // Check nodes
      cy.nodes().forEach((node) => {
        const baseX = Number(node.data('baseX'));
        const baseY = Number(node.data('baseY'));
        const dx = pointer.x - baseX;
        const dy = pointer.y - baseY;
        const distance = Math.hypot(dx, dy);
        if (
          distance <= nodeActivationRadius &&
          distance < nearestNodeDistance
        ) {
          nearestNodeDistance = distance;
          targetKey = node.data('clusterKey');
        }
      });

      // Check clusters if no node hit
      if (!targetKey) {
        let nearestDistance = Number.POSITIVE_INFINITY;
        centers.forEach((meta, key) => {
          const dx = pointer.x - meta.centerX;
          const dy = pointer.y - meta.centerY;
          const distance = Math.hypot(dx, dy);
          if (
            distance <= meta.baseRadius + hoverGraceDistance &&
            distance < nearestDistance
          ) {
            nearestDistance = distance;
            targetKey = key;
          }
        });
      }
      chooseCluster(targetKey);
    };

    const handlePointerMove = (event: MouseEvent) => {
      pendingPointerEvent.current = event;
      if (pointerMoveRaf.current != null) return;
      pointerMoveRaf.current = requestAnimationFrame(() => {
        pointerMoveRaf.current = null;
        const latestEvent = pendingPointerEvent.current;
        if (latestEvent) {
          processPointerMove(latestEvent);
        }
      });
    };

    const handlePointerLeave = () => {
      pointerPosition.current = null;
      pendingPointerEvent.current = null;
      if (pointerMoveRaf.current != null) {
        cancelAnimationFrame(pointerMoveRaf.current);
        pointerMoveRaf.current = null;
      }
      // Trigger collapse on leave
      pointerInsideCluster.current = false;
      lastPointerCluster.current = null;
      queueCollapse();
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mouseleave', handlePointerLeave);
      if (pointerMoveRaf.current != null) {
        cancelAnimationFrame(pointerMoveRaf.current);
        pointerMoveRaf.current = null;
      }
      pendingPointerEvent.current = null;
    };
  }, [nodeActivationRadius, hoverGraceDistance, queueCollapse]);

  const stylesheet = useMemo<(StylesheetStyle | StylesheetCSS)[]>(() => {
    return [
      {
        selector: 'node',
        style: {
          width: 62,
          height: 62,
          'background-color': pastelPalette.background,
          'border-color': pastelPalette.border,
          'border-width': 2,
          'border-style': 'solid',
          label: 'data(shortLabel)',
          'text-wrap': 'wrap',
          'text-valign': 'center',
          'text-halign': 'center',
          'text-max-width': '52px',
          'font-size': 9,
          color: '#51385d',
          'overlay-opacity': 0,
          'overlay-padding': 24,
          'shadow-blur': 12,
          'shadow-color': 'rgba(81, 56, 93, 0.08)',
          'shadow-offset-x': 0,
          'shadow-offset-y': 3,
          'transition-property':
            'background-color border-width border-color shadow-color shadow-blur opacity',
          'transition-duration': 200,
          'z-index-compare': 'manual',
          'z-index': 2,
          'animation-name': 'nodePulse',
          'animation-duration': '5s',
          'animation-iteration-count': 'infinite',
          'animation-direction': 'alternate',
          'animation-timing-function': 'ease-in-out',
        },
      },
      {
        selector: 'node.cluster-expanded',
        style: {
          'z-index': 999,
          'shadow-blur': 36,
          'shadow-color': 'rgba(255, 182, 218, 0.8)',
        },
      },
      {
        selector: 'node.neighbor-repelled',
        style: {
          opacity: 0.18,
        },
      },
      {
        selector: 'node[searchDim = 1]',
        style: {
          opacity: 0.1, // Strong dimming for non-matching nodes
          'border-color': '#e0e0e0', // Fade border
          'shadow-opacity': 0,
          'z-index': 0, // Push to back
        },
      },
      {
        selector: 'node[status = "Mastered"]',
        style: {
          'background-color': pastelPalette.mastered,
          'border-color': '#65c7ab',
        },
      },
      {
        selector: 'node[status = "Stable"]',
        style: {
          'background-color': pastelPalette.stable,
          'border-color': '#f0b85d',
        },
      },
      {
        selector: 'node[status = "In Progress"]',
        style: {
          'background-color': pastelPalette.progress,
          'border-color': '#db6c9d',
        },
      },
      {
        selector: 'node[highlight = 1]',
        style: {
          'border-width': 6,
          'border-color': '#ff79c6',
          'background-color': '#fff5fb',
        },
      },
      {
        selector: 'node[focus = 1]',
        style: {
          width: 70,
          height: 70,
          'border-width': 6,
          'border-color': '#ff8dc6',
          'shadow-color': 'rgba(255, 146, 200, 0.9)',
          'shadow-blur': 32,
          'z-index': 600,
        },
      },
      {
        selector: 'node[neighbor = 1]',
        style: {
          'border-color': '#b292ff',
          'background-color': '#f8f5ff',
        },
      },
      {
        selector: 'node[depthState = "under"]',
        style: {
          'shadow-color': 'rgba(255, 161, 201, 0.8)',
          'shadow-blur': 26,
        },
      },
      {
        selector: 'node[depthState = "on-track"]',
        style: {
          'shadow-color': 'rgba(146, 236, 206, 0.8)',
          'shadow-blur': 22,
        },
      },
      {
        selector: 'node[depthState = "ahead"]',
        style: {
          'shadow-color': 'rgba(153, 198, 255, 0.8)',
          'shadow-blur': 22,
        },
      },
      {
        selector: 'node[depthState = "unset"]',
        style: {
          'shadow-color': 'rgba(190, 174, 214, 0.55)',
          'shadow-blur': 18,
        },
      },
      {
        selector: 'edge',
        style: {
          width: 3,
          'line-color': '#e2c6ff',
          'target-arrow-color': '#e2c6ff',
          'target-arrow-shape': 'triangle-backcurve', // Softer, heart-like arrow
          'curve-style': 'unbundled-bezier', // Magical swoopy lines
          'control-point-distances': [20, -20], // Wavy effect
          'control-point-weights': [0.25, 0.75],
          'line-style': 'solid',
          opacity: 0.6,
          'transition-property': 'opacity line-color width',
          'transition-duration': 200,
        },
      },
      {
        selector: 'edge[relationship = "cross-track"]',
        style: {
          'line-style': 'dashed',
          'line-dash-pattern': [6, 6],
        },
      },
      {
        selector: 'edge[focusEdge = 1]',
        style: {
          width: 4,
          'line-color': '#ff9fdc',
          'target-arrow-color': '#ff9fdc',
          opacity: 0.95,
        },
      },
      {
        selector: 'edge[highlight = 1]',
        style: {
          width: 3.5,
          'line-color': '#ff9fdc',
          'target-arrow-color': '#ff9fdc',
          opacity: 0.85,
        },
      },
      {
        selector: 'edge[searchDim = 1]',
        style: {
          opacity: 0.05, // Almost invisible lines for dimmed paths
        },
      },
    ];
  }, []);

  const clampTooltipCoords = useCallback(
    (x: number, y: number) => {
      const container = containerRef.current;
      if (!container) {
        return { x, y };
      }
      const width = container.clientWidth;
      const height = container.clientHeight;
      const maxLeft = Math.max(12, width - 220);
      const maxTop = Math.max(12, height - 140);
      return {
        x: clampValue(x, 12, maxLeft),
        y: clampValue(y, 12, maxTop),
      };
    },
    [],
  );

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const handleTap = (event: EventObjectNode) => {
      const id = event.target.id();
      onSelectTopic?.(id);
    };

    const handleMouseOver = (event: EventObjectNode) => {
      const renderedPos = event.renderedPosition;
      const coords = clampTooltipCoords(renderedPos.x + 10, renderedPos.y + 10);
      setTooltip({
        visible: true,
        x: coords.x,
        y: coords.y,
        id: event.target.data('id'),
        title: event.target.data('label'),
        description: event.target.data('description'),
        status: event.target.data('status'),
        depthTarget: event.target.data('depthTarget') || '—',
        depthMessage: event.target.data('depthMessage') || '',
      });
      const key = event.target.data('clusterKey');
      if (key) {
        if (collapseTimeout.current) {
          clearTimeout(collapseTimeout.current);
          collapseTimeout.current = null;
        }
        pointerInsideCluster.current = true;
        setExpandedCluster(key);
      }
    };

    const handleMouseOut = (event: EventObjectNode) => {
      setTooltip((prev) => ({ ...prev, visible: false }));
      const key = event.target.data('clusterKey');
      if (collapseTimeout.current) {
        clearTimeout(collapseTimeout.current);
        collapseTimeout.current = null;
      }
      if (key) {
        const currentKey = expandedClusterRef.current;
        const pointer = pointerPosition.current;
        const centers = clusterCentersRef.current;
        if (pointer && currentKey && currentKey === key) {
          const meta = centers.get(currentKey);
          if (meta) {
            const dist = Math.hypot(
              pointer.x - meta.centerX,
              pointer.y - meta.centerY,
            );
            if (dist <= meta.expandedRadius + hoverGraceDistance) {
              pointerInsideCluster.current = true;
              return;
            }
          }
        }
        pointerInsideCluster.current = false;
      }
      queueCollapse();
    };

    // Force cursor reset on tap/click to prevent default browser revert
    const forceCursor = () => {
        if (containerRef.current) {
            containerRef.current.style.cursor = 'var(--cursor-paw)';
        }
        document.body.style.cursor = 'var(--cursor-paw)';
    };

    cy.on('tap', 'node', handleTap);
    cy.on('tap', forceCursor); 
    
    // Add low-level listeners to the container to fight browser defaults
    const container = containerRef.current;
    if (container) {
        container.addEventListener('mousedown', forceCursor);
        container.addEventListener('mouseup', forceCursor);
        container.addEventListener('click', forceCursor);
    }

    cy.on('mouseover', 'node', handleMouseOver);
    cy.on('mouseout', 'node', handleMouseOut);

    return () => {
      cy.off('tap', 'node', handleTap);
      cy.off('tap', forceCursor);
      cy.off('mouseover', 'node', handleMouseOver);
      cy.off('mouseout', 'node', handleMouseOut);
      if (container) {
          container.removeEventListener('mousedown', forceCursor);
          container.removeEventListener('mouseup', forceCursor);
          container.removeEventListener('click', forceCursor);
      }
      if (collapseTimeout.current) {
        clearTimeout(collapseTimeout.current);
        collapseTimeout.current = null;
      }
    };
  }, [onSelectTopic, queueCollapse, clampTooltipCoords]);

  return (
    <div className="graph-wrapper" ref={containerRef}>
      <div className="graph-lane-labels" aria-hidden="true">
        {laneTracks.map((track) => (
          <span key={track}>
            <p>Pathway {track}</p>
            <small>{trackTitles.get(track) || ''}</small>
          </span>
        ))}
      </div>
      <div className="graph-controls" aria-label="Graph controls">
        <button type="button" onClick={() => handleZoom(1.2)}>
          +
        </button>
        <button type="button" onClick={() => handleZoom(0.8)}>
          −
        </button>
        <button type="button" onClick={resetView}>
          Reset
        </button>
      </div>
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        style={{ width: '100%', height: `${graphHeight}px`, cursor: 'var(--cursor-paw)' }}
        layout={{
          name: 'preset',
          animate: true,
          animationDuration: 400,
          animationEasing: 'ease-out',
          fit: false,
          padding: 40,
        }}
        wheelSensitivity={0.2}
        minZoom={minZoom}
        maxZoom={maxZoom}
        boxSelectionEnabled={false}
        autoungrabify
        panningEnabled
        cy={(instance) => {
          cyRef.current = instance;
        }}
      />
      {tooltip.visible && (
        <div
          className="graph-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <p className="graph-tooltip__id">{tooltip.id}</p>
          <p className="graph-tooltip__title">{tooltip.title}</p>
          <p className="graph-tooltip__desc">{tooltip.description}</p>
          <p className="graph-tooltip__meta">
            {tooltip.status} · Spirit Level {tooltip.depthTarget}
          </p>
          <p className="graph-tooltip__delta">{tooltip.depthMessage}</p>
        </div>
      )}
    </div>
  );
}
