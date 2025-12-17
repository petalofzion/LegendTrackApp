<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import cytoscape, { type Core, type EventObjectNode, type Stylesheet, type ElementDefinition } from 'cytoscape';
  import type { Topic } from '../types';
  import { deriveDepthDelta, depthDeltaMessage } from '../utils/depth';
  import { findQuestPath, calculateCentrality, detectCommunities } from '../services/graphAnalysis';

  interface Props {
    topics: Topic[];
    highlightedIds: Set<string>;
    focusedTopicId?: string | null;
    activeQuestId?: string | null;
    nexusMode?: boolean;
    covenMode?: boolean;
    onSelectTopic?: (topicId: string) => void;
    searchTerm?: string;
  }

  let { 
    topics, 
    highlightedIds, 
    focusedTopicId = null, 
    activeQuestId = null,
    nexusMode = false,
    covenMode = false,
    onSelectTopic, 
    searchTerm = '' 
  }: Props = $props();

  const pastelPalette = {
    background: '#fde6ff',
    border: '#f8c2e3',
    mastered: '#a5f5dc',
    stable: '#ffe5a7',
    progress: '#ffbadb',
    default: '#d3d9ff',
  };

  const clampValue = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  const escapeSelector = (str: string) => str.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');

  let containerRef: HTMLDivElement;
  let graphContainer: HTMLDivElement;
  let cy = $state<Core | null>(null);
  
  // Tooltip State
  let tooltip = $state({
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

  // Cluster State
  let expandedCluster = $state<string | null>(null);
  
  // Constants
  const trackSpacing = 260;
  const epochSpacing = 192;
  const hoverRepelDistance = 18;
  const rippleRange = 210;
  const rippleMaxOffset = 24;
  const rippleFalloff = 1.4;
  const hoverGraceDistance = 12;
  const nodeActivationRadius = 36;
  const collapseDelayMs = 180;
  const minZoom = 0.4;
  const maxZoom = 2.2;

  // Refs (Variables) for logic loop
  let tooltipTimer: ReturnType<typeof setTimeout> | null = null;
  let collapseTimeout: ReturnType<typeof setTimeout> | null = null;
  let idleCollapseTimeout: ReturnType<typeof setTimeout> | null = null;
  let prevExpandedCluster: string | null = null;
  let pointerOverNode = false; // New flag to track direct node interaction
  let pointerPosition: { x: number; y: number } | null = null;
  let pointerMoveRaf: number | null = null;
  let pendingPointerEvent: MouseEvent | null = null;
  let initialFitDone = false;
  let clusterCentersRef: Map<string, any> = new Map();
  let expandedClusterRef: string | null = null;
  let hideTooltipTimeout: ReturnType<typeof setTimeout> | null = null;

  // --- Derived Calculations ---

  let laneTracks = $derived.by(() => {
    const order = Array.from(new Set(topics.map(t => t.track?.toUpperCase() || '').filter(t => t.length > 0))).sort();
    if (order.length) return order;
    return ['A', 'B', 'C', 'D', 'E'];
  });

  let trackTitles = $derived.by(() => {
    const mapping = new Map<string, string>();
    for (const topic of topics) {
      if (topic.track && topic.trackTitle && !mapping.has(topic.track)) {
        mapping.set(topic.track, topic.trackTitle);
      }
    }
    return mapping;
  });

  let maxEpoch = $derived(topics.reduce((max, t) => (typeof t.epoch === 'number' ? Math.max(max, t.epoch) : max), 0));
  let graphHeight = $derived(Math.max(460, Math.min(920, (maxEpoch + 1) * epochSpacing + 260)));

  let topicById = $derived.by(() => {
    const map = new Map<string, Topic>();
    for (const topic of topics) map.set(topic.id, topic);
    return map;
  });

  let neighborIds = $derived.by(() => {
    if (!focusedTopicId) return new Set<string>();
    const neighbors = new Set<string>();
    const addRelated = (source: Topic) => {
      if (!source.relatedTopicIds) return;
      source.relatedTopicIds.split(',').map(id => id.trim()).filter(Boolean).forEach(id => neighbors.add(id));
    };
    const focusedTopic = topicById.get(focusedTopicId);
    if (focusedTopic) addRelated(focusedTopic);
    for (const topic of topics) {
      if (!topic.relatedTopicIds) continue;
      const ids = topic.relatedTopicIds.split(',').map(id => id.trim()).filter(Boolean);
      if (ids.includes(focusedTopicId)) neighbors.add(topic.id);
    }
    neighbors.delete(focusedTopicId);
    return neighbors;
  });

  // Graph Data Calculation
  let graphData = $derived.by(() => {
    const clusterCenters = new Map<string, { centerX: number; centerY: number; baseRadius: number; expandedRadius: number }>();
    const bucketCounts = new Map<string, number>();
    topics.forEach(t => {
      const key = `${t.epoch}-${t.track}`;
      bucketCounts.set(key, (bucketCounts.get(key) ?? 0) + 1);
    });

    const bucketOffsets = new Map<string, number>();
    const topicIdSet = new Set(topics.map(t => t.id));
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const isSearchActive = normalizedSearch.length > 0;
    const searchDimById = new Map<string, number>();

    const nodes = topics.map(topic => {
      const depthMeta = deriveDepthDelta(topic);
      const epochRow = topic.epoch ?? 0;
      const trackIndex = topic.track ? laneTracks.indexOf(topic.track.toUpperCase()) : -1;
      const fallbackIndex = trackIndex >= 0 ? trackIndex : 0; 
      const centerX = fallbackIndex * trackSpacing;
      const centerY = epochRow * epochSpacing;
      const key = `${topic.epoch}-${topic.track}`;
      const processed = bucketOffsets.get(key) ?? 0;
      bucketOffsets.set(key, processed + 1);
      const total = bucketCounts.get(key) ?? 1;
      const radialAngle = total > 1 ? (Math.PI * 2 * processed) / total : 0;
      
      const radius = Math.min(62, 10 + Math.sqrt(total) * 8.2);
      const minCircumference = total * 80;
      const minExpansionRadius = minCircumference / (2 * Math.PI);
      const expansionDistance = Math.max(radius + 100, minExpansionRadius);

      const deltaX = radius * Math.cos(radialAngle || 0);
      const deltaY = radius * Math.sin(radialAngle || 0);
      const baseX = centerX + deltaX;
      const baseY = centerY + deltaY;
      const expandedX = centerX + Math.cos(radialAngle || 0) * expansionDistance;
      const expandedY = centerY + Math.sin(radialAngle || 0) * expansionDistance;
      const holdRadius = expansionDistance; // Tighter radius for snappier collapse
      const baseHitRadius = radius + hoverRepelDistance;
      const expandedHitRadius = holdRadius;

      const meta = clusterCenters.get(key);
      if (!meta || holdRadius > meta.expandedRadius) {
        clusterCenters.set(key, { centerX, centerY, baseRadius: baseHitRadius, expandedRadius: expandedHitRadius });
      }

      const matchesSearch = !isSearchActive || 
        topic.id.toLowerCase().includes(normalizedSearch) ||
        topic.topicName.toLowerCase().includes(normalizedSearch) ||
        topic.description.toLowerCase().includes(normalizedSearch);
      
      const searchDim = !matchesSearch ? 1 : 0;
      searchDimById.set(topic.id, searchDim);

      return {
        group: 'nodes',
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
          centerX, centerY, clusterAngle: radialAngle,
          baseRadius: radius, clusterKey: key,
          baseX, baseY, expandedX, expandedY,
          searchDim
        },
        position: { x: baseX, y: baseY }
      };
    });

    const seenEdges = new Set<string>();
    const edges = topics.flatMap(topic => {
      if (!topic.relatedTopicIds) return [];
      const relatedIds = topic.relatedTopicIds.split(',').map(id => id.trim()).filter(Boolean).filter(id => topicIdSet.has(id));
      
      return relatedIds.flatMap(targetId => {
        const canonical = topic.id < targetId ? `${topic.id}::${targetId}` : `${targetId}::${topic.id}`;
        if (seenEdges.has(canonical)) return [];
        seenEdges.add(canonical);
        
        const isDimmed = searchDimById.get(topic.id) === 1 || searchDimById.get(targetId) === 1;

        return [{
          group: 'edges',
          data: {
            id: `${topic.id}=>${targetId}`,
            source: topic.id,
            target: targetId,
            highlight: highlightedIds.has(topic.id) || highlightedIds.has(targetId) ? 1 : 0,
            relationship: topicById.get(targetId)?.track === topic.track ? 'same-track' : 'cross-track',
            focusEdge: focusedTopicId && (topic.id === focusedTopicId || targetId === focusedTopicId || neighborIds.has(topic.id) || neighborIds.has(targetId)) ? 1 : 0,
            searchDim: isDimmed ? 1 : 0
          }
        }];
      });
    });

    return { elements: [...nodes, ...edges], clusterCenters };
  });

  // Stylesheet
  const stylesheet: Stylesheet[] = [
      {
        selector: 'node',
        style: {
          width: 62, height: 62,
          'background-color': pastelPalette.background,
          'border-color': pastelPalette.border,
          'border-width': 2, 'border-style': 'solid',
          label: 'data(shortLabel)',
          'text-wrap': 'wrap', 'text-valign': 'center', 'text-halign': 'center', 'text-max-width': 52,
          'font-size': 9, color: '#51385d',
          'overlay-opacity': 0, 'overlay-padding': 24,
          'transition-property': 'background-color, border-width, border-color',
          'transition-duration': 200, 'transition-timing-function': 'ease-in-out',
          'z-index-compare': 'manual', 'z-index': 2,
        }
      },
      { selector: 'node.cluster-expanded', style: { 'z-index': 999 } },
      { selector: 'node[searchDim = 1]', style: { opacity: 0.1, 'border-color': '#e0e0e0', 'z-index': 0 } },
      { selector: 'node[status = "Mastered"]', style: { 'background-color': pastelPalette.mastered, 'border-color': '#65c7ab' } },
      { selector: 'node[status = "Stable"]', style: { 'background-color': pastelPalette.stable, 'border-color': '#f0b85d' } },
      { selector: 'node[status = "In Progress"]', style: { 'background-color': pastelPalette.progress, 'border-color': '#db6c9d' } },
      { selector: 'node[highlight = 1]', style: { 'border-width': 6, 'border-color': '#ff79c6', 'background-color': '#fff5fb' } },
      { selector: 'node[focus = 1]', style: { width: 70, height: 70, 'border-width': 6, 'border-color': '#ff8dc6', 'z-index': 600 } },
      { selector: 'node[neighbor = 1]', style: { 'border-color': '#b292ff', 'background-color': '#f8f5ff' } },
      { selector: 'node[depthState = "under"]', style: {} },
      { selector: 'node[depthState = "on-track"]', style: {} },
      { selector: 'node[depthState = "ahead"]', style: {} },
      { selector: 'node[depthState = "unset"]', style: {} },

      // Coven Mode (Clustering)
      { selector: 'node[covenState = "active"]', style: { 'background-color': 'data(communityColor)', 'border-width': 0, 'opacity': 0.9 } },

      // Nexus Mode Styles
      { selector: 'node[nexusState = "keystone"]', style: { 'border-width': 8, 'border-color': '#c0a3e5', 'width': 80, 'height': 80, 'font-weight': 'bold', 'z-index': 850 } },
      { selector: 'node[nexusState = "dim"]', style: { 'opacity': 0.3, 'grayscale': 1, 'z-index': 1 } },
      { selector: 'edge[nexusState = "dim"]', style: { 'opacity': 0.1, 'z-index': 0 } },

      // Quest Mode Styles
      { selector: 'node[questState = "active"]', style: { 'border-color': '#ffe082', 'border-width': 5, 'background-color': '#fff8e1', 'z-index': 800 } },
      { selector: 'node[questState = "target"]', style: { 'border-color': '#ffca28', 'border-width': 7, 'background-color': '#fff3e0', 'width': 74, 'height': 74, 'z-index': 900 } },
      { selector: 'node[questState = "dim"]', style: { 'opacity': 0.15, 'z-index': 1 } },
      { selector: 'edge[questState = "active"]', style: { 'line-color': '#ffe082', 'width': 5, 'line-style': 'dashed', 'target-arrow-color': '#ffe082', 'opacity': 1, 'z-index': 800 } },
      { selector: 'edge[questState = "dim"]', style: { 'opacity': 0.05, 'z-index': 0 } },

      {
        selector: 'edge',
        style: {
          width: 3, 'line-color': '#e2c6ff', 'target-arrow-color': '#e2c6ff',
          'target-arrow-shape': 'triangle-backcurve', 'curve-style': 'unbundled-bezier',
          'control-point-distances': [20, -20], 'control-point-weights': [0.25, 0.75],
          'line-style': 'solid', opacity: 0.6,
          'transition-property': 'opacity, line-color, width', 'transition-duration': 200
        }
      },
      { selector: 'edge[relationship = "cross-track"]', style: { 'line-style': 'dashed', 'line-dash-pattern': [6, 6] } },
      { selector: 'edge[focusEdge = 1]', style: { width: 4, 'line-color': '#ff9fdc', 'target-arrow-color': '#ff9fdc', opacity: 0.95 } },
      { selector: 'edge[highlight = 1]', style: { width: 3.5, 'line-color': '#ff9fdc', 'target-arrow-color': '#ff9fdc', opacity: 0.85 } },
      { selector: 'edge[searchDim = 1]', style: { opacity: 0.05 } }
  ];

  // Logic Functions

  function handleZoom(factor: number) {
    if (!cy) return;
    cy.stop(true);
    const newZoom = Math.min(Math.max(cy.zoom() * factor, minZoom), maxZoom);
    cy.zoom({ level: newZoom, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
  }

  function resetView() {
    if (!cy) return;
    cy.fit(undefined, 60);
    cy.center();
  }

  function clampTooltipCoords(x: number, y: number) {
    if (!containerRef) return { x, y };
    const width = containerRef.clientWidth;
    const height = containerRef.clientHeight;
    return {
      x: clampValue(x, 12, Math.max(12, width - 220)),
      y: clampValue(y, 12, Math.max(12, height - 140))
    };
  }

  // Animation & Interaction Logic (Ported from React useEffects)
  const updateFade = (key: string | null) => {
      if (!cy) return;
      
      // Safety: Ensure key matches at least one node
      if (key) {
          const hasMatch = cy.nodes().some(n => n.data('clusterKey') === key);
          if (!hasMatch) key = null;
      }

      cy.batch(() => {
          cy.nodes().forEach(node => {
              const nodeKey = node.data('clusterKey');
              if (key && nodeKey !== key) {
                  // Fade out target
                  node.data('targetOpacity', 0.18);
              } else {
                  // Reset target
                  node.data('targetOpacity', 1.0);
              }
          });
      });
  };

  const setExpandedCluster = (key: string | null) => {
    // If switching clusters, kill any lingering tooltip from the old cluster
    if (key !== expandedCluster) {
        tooltip.visible = false;
        if (hideTooltipTimeout) clearTimeout(hideTooltipTimeout);
        if (tooltipTimer) clearTimeout(tooltipTimer);
    }

    expandedCluster = key;
    expandedClusterRef = key;
    
    // Manage Safe Zone Plate
    if (cy) {
        const safeZone = cy.getElementById('safe-zone');
        if (safeZone.length > 0) cy.remove(safeZone);

        if (key) {
            const meta = clusterCentersRef.get(key);
            if (meta) {
                // Spawn invisible plate to handle hit-testing
                cy.add({
                    group: 'nodes',
                    data: { 
                        id: 'safe-zone', 
                        clusterKey: key, 
                        isSafeZone: true 
                    },
                    position: { x: meta.centerX, y: meta.centerY },
                    style: {
                        width: (meta.expandedRadius + hoverGraceDistance) * 2 + 50, 
                        height: (meta.expandedRadius + hoverGraceDistance) * 2 + 50,
                        'background-opacity': 0, // Invisible background
                        'border-width': 0,       // No border
                        'z-index': 1, 
                        'events': 'yes' 
                    }
                });
            }
        }
    }

    // Immediate Visual Update (Idempotent to fix stuck fades)
    updateFade(key);
  };

  // Effect: Update refs for logic loop
  $effect(() => {
    clusterCentersRef = graphData.clusterCenters;
  });

  // Effect: Idle collapse (Optional safety net, kept for now)
  $effect(() => {
    if (idleCollapseTimeout) {
      clearTimeout(idleCollapseTimeout);
      idleCollapseTimeout = null;
    }
    if (!expandedCluster) return;

    idleCollapseTimeout = setTimeout(() => {
      idleCollapseTimeout = null;
      const currentKey = expandedClusterRef;
      const pointer = pointerPosition;
      const centers = clusterCentersRef;
      if (!currentKey || !pointer) return;
      const meta = centers.get(currentKey);
      if (!meta) return;
      const dist = Math.hypot(pointer.x - meta.centerX, pointer.y - meta.centerY);
      
      // Safety net: If mouse is inexplicably far, collapse
      if (dist > meta.expandedRadius + hoverGraceDistance + 100) {
        setExpandedCluster(null);
      }
    }, collapseDelayMs);
  });

  // Effect 1: Data Synchronization
  $effect(() => {
    if (!cy) return;
    const { elements } = graphData;
    
    cy.batch(() => {
        const existingNodes = cy!.nodes();
        const existingEdges = cy!.edges();
        const newIds = new Set(elements.map(e => e.data.id));
        
        // Remove old
        cy!.remove(existingNodes.filter(n => !newIds.has(n.id())));
        cy!.remove(existingEdges.filter(e => !newIds.has(e.id())));

        // Add/Update
        elements.forEach(ele => {
            const el = cy!.getElementById(ele.data.id);
            if (el.length > 0) {
                const currentData = el.data();
                const newData = ele.data;
                const keysToSync = [
                    'label', 'status', 'highlight', 'focus', 'neighbor', 
                    'depthState', 'depthTarget', 'depthMessage', 'searchDim',
                    'expandedX', 'expandedY', 'baseX', 'baseY', 'clusterKey', 'clusterAngle'
                ];
                keysToSync.forEach(key => {
                    if (currentData[key] !== newData[key]) {
                        el.data(key, newData[key]);
                    }
                });
            } else {
                const plainElement = {
                    group: ele.group,
                    data: JSON.parse(JSON.stringify(ele.data)),
                    position: ele.position ? { ...ele.position } : undefined,
                    selected: ele.selected,
                    selectable: ele.selectable,
                    locked: ele.locked,
                    grabbable: ele.grabbable,
                    classes: ele.classes
                };
                cy!.add(plainElement);
            }
        });
    });
    
    if (!initialFitDone && elements.length > 0) {
        resetView();
        initialFitDone = true;
    }
  });

  // Effect 2: Physics-based Animation Loop
  $effect(() => {
    if (!cy) return;
    
    const current = expandedCluster; 
    const previous = prevExpandedCluster; 

    if (current === previous) return;
    prevExpandedCluster = current;

    // Physics Engine
    const stiffness = 0.06; // 0.1 = Sluggish, 0.3 = Snappy
    const friction = 0.8;
    const minMove = 0.5;

    let loopRaf: number | null = null;

    const runPhysics = () => {
        let active = false;
        
        // 1. Determine Targets
        // Ideally we cache this, but calculating per frame is robust against thrashing
        const nodes = cy!.nodes();
        const escapeSelector = (str: string) => str.replace(/([!"#$%&'()*+,./:;<=>?@[\\]^`{|}~])/g, '\\$1');
        
        // Context for Ripple
        let expandedMeta: any = null;
        let expandedNodes: any = null;
        if (current) {
            expandedMeta = clusterCentersRef.get(current);
            // Explicit filter to avoid selector bugs
            expandedNodes = cy!.nodes().filter((n: any) => n.data('clusterKey') === current);
        }

        nodes.forEach(node => {
            // Determine Goal Position
            let targetX = Number(node.data('baseX'));
            let targetY = Number(node.data('baseY'));
            const isExpandedNode = expandedNodes && expandedNodes.has(node);

            if (isExpandedNode) {
                targetX = Number(node.data('expandedX'));
                targetY = Number(node.data('expandedY'));
            } else if (current && expandedMeta) {
                // Apply Ripple Push to Neighbors
                const baseX = Number(node.data('baseX'));
                const baseY = Number(node.data('baseY'));
                const dx = baseX - expandedMeta.centerX;
                const dy = baseY - expandedMeta.centerY;
                const dist = Math.hypot(dx, dy) || 1;
                
                const safeZone = expandedMeta.expandedRadius + 60;
                const rippleReach = safeZone + 320;

                if (dist < rippleReach) {
                    if (dist < safeZone) {
                        // Hard push
                        const pushFactor = safeZone / dist;
                        targetX = expandedMeta.centerX + dx * pushFactor * 1.05;
                        targetY = expandedMeta.centerY + dy * pushFactor * 1.05;
                    } else {
                        // Soft nudge
                        const proximity = 1 - ((dist - safeZone) / 320);
                        const nudge = proximity * 60;
                        const scale = (dist + nudge) / dist;
                        targetX = expandedMeta.centerX + dx * scale;
                        targetY = expandedMeta.centerY + dy * scale;
                    }
                }
            }

            // Interpolate (Lerp)
            const pos = node.position();
            const dx = targetX - pos.x;
            const dy = targetY - pos.y;
            const dist = Math.hypot(dx, dy);

            if (dist > minMove) {
                active = true;
                node.position({
                    x: pos.x + dx * stiffness,
                    y: pos.y + dy * stiffness
                });
            } else if (dist > 0) {
                // Snap to finish
                node.position({ x: targetX, y: targetY });
            }

            // Opacity Interpolation (Manual Fade)
            const currentOp = Number(node.style('opacity')); // Cytoscape returns numbers for opacity
            let targetOp = node.data('targetOpacity');
            if (typeof targetOp !== 'number') targetOp = 1.0;

            if (node.data('questState') === 'dim') {
                targetOp = 0.1;
            }

            if (node.data('nexusState') === 'dim') {
                targetOp = 0.3;
            }

            if (Math.abs(currentOp - targetOp) > 0.01) {
                active = true;
                const nextOp = currentOp + (targetOp - currentOp) * 0.05; // 0.05 = Very smooth/slow
                node.style('opacity', nextOp);
            } else if (currentOp !== targetOp) {
                node.style('opacity', targetOp); // Snap
            }
        });

        if (active) {
            loopRaf = requestAnimationFrame(runPhysics);
        }
    };

    // Kill any existing Cytoscape animations to prevent fighting
    cy!.nodes().stop(true);
    
    // Start Physics Loop
    runPhysics();

    return () => {
        if (loopRaf) cancelAnimationFrame(loopRaf);
    };
  });

  // Coven Mode Logic
  $effect(() => {
    if (!cy) return;

    if (covenMode) {
      detectCommunities(cy);
    }

    cy.batch(() => {
      if (!covenMode) {
        cy!.elements().removeData('covenState');
      } else {
        cy!.nodes().forEach(n => {
          if (n.data('communityColor')) {
            n.data('covenState', 'active');
          }
        });
      }
    });
  });

  // Nexus Mode Logic
  $effect(() => {
    if (!cy) return;
    
    if (nexusMode) {
       calculateCentrality(cy);
    }

    cy.batch(() => {
      if (!nexusMode) {
        cy!.elements().removeData('nexusState');
      } else {
        cy!.nodes().forEach(n => {
          if (n.data('isKeystone')) {
            n.data('nexusState', 'keystone');
          } else {
            n.data('nexusState', 'dim');
          }
        });
        cy!.edges().forEach(e => e.data('nexusState', 'dim'));
      }
    });
  });

  // Quest Mode Logic
  $effect(() => {
    if (!cy) return;

    cy.batch(() => {
      if (!activeQuestId) {
        // Clear Quest State
        cy!.elements().removeData('questState');
      } else {
        const { nodeIds, edgeIds } = findQuestPath(cy!, activeQuestId);
        
        cy!.nodes().forEach(n => {
          if (n.id() === activeQuestId) {
            n.data('questState', 'target');
          } else if (nodeIds.has(n.id())) {
            n.data('questState', 'active');
          } else {
            n.data('questState', 'dim');
          }
        });

        cy!.edges().forEach(e => {
          if (edgeIds.has(e.id())) {
            e.data('questState', 'active');
          } else {
            e.data('questState', 'dim');
          }
        });
      }
    });
  });

  // Mount
  onMount(() => {
    cy = cytoscape({
      container: graphContainer,
      style: stylesheet as any,
      layout: { name: 'preset', padding: 40 },
      wheelSensitivity: 0.2,
      minZoom, maxZoom,
      boxSelectionEnabled: false,
      autoungrabify: true,
      elements: []
    });

    cy.on('tap', 'node', (e: EventObjectNode) => onSelectTopic?.(e.target.id()));
    
    const forceCursor = () => {
      if (containerRef) containerRef.style.cursor = 'var(--cursor-paw)';
      document.body.style.cursor = 'var(--cursor-paw)';
    };
    cy.on('tap', forceCursor);
    containerRef.addEventListener('mousedown', forceCursor);
    containerRef.addEventListener('mouseup', forceCursor);
    containerRef.addEventListener('click', forceCursor);

    // Optimized MouseOver
    cy.on('mouseover', 'node', (e: EventObjectNode) => {
      if (hideTooltipTimeout) {
        clearTimeout(hideTooltipTimeout);
        hideTooltipTimeout = null;
      }
      // Cancel any pending show timer
      if (tooltipTimer) {
          clearTimeout(tooltipTimer);
          tooltipTimer = null;
      }

      pointerOverNode = true;
      const pos = e.renderedPosition;
      const coords = clampTooltipCoords(pos.x + 10, pos.y + 10);
      const d = e.target.data();
      const key = d.clusterKey;

      if (d.isSafeZone) {
          // Hovering the safe zone plate: Keep expanded, no tooltip
          if (collapseTimeout) {
              clearTimeout(collapseTimeout);
              collapseTimeout = null;
          }
          // Keep tooltip alive if we are in the safe zone
          if (hideTooltipTimeout) {
              clearTimeout(hideTooltipTimeout);
              hideTooltipTimeout = null;
          }
          pointerOverNode = true;
          return;
      }
      
      // Expand Cluster on Hover
      if (key) {
        pointerPosition = e.position || pointerPosition;
        if (collapseTimeout) {
            clearTimeout(collapseTimeout);
            collapseTimeout = null;
        }
        setExpandedCluster(key);
      }

      // Delay Tooltip to allow expansion
      tooltipTimer = setTimeout(() => {
          if (pointerOverNode) {
              tooltip = {
                visible: true, x: coords.x, y: coords.y,
                id: d.id, title: d.label, description: d.description,
                status: d.status, depthTarget: d.depthTarget || '—', depthMessage: d.depthMessage || ''
              };
          }
      }, 300);
    });

    // Optimized MouseOut
    cy.on('mouseout', 'node', (e: EventObjectNode) => {
      pointerOverNode = false;
      
      // Cancel pending show timer
      if (tooltipTimer) {
          clearTimeout(tooltipTimer);
          tooltipTimer = null;
      }

      // Debounce hide to prevent flicker during expansion movement
      hideTooltipTimeout = setTimeout(() => {
        tooltip.visible = false;
      }, 200);
    });


    // Simplified Interaction Logic (Event-Driven)
    const handleInteraction = (event: MouseEvent) => {
        if (!cy) return;
        
        // Only update pointer for physics/idle checks
        const rect = graphContainer.getBoundingClientRect();
        const zoom = cy.zoom();
        const pan = cy.pan();
        const pointer = { 
            x: (event.clientX - rect.left - pan.x) / zoom, 
            y: (event.clientY - rect.top - pan.y) / zoom 
        };
        pointerPosition = pointer;

        // Check Safe Zone Radius
        let isInsideRadius = false;
        if (expandedClusterRef) {
            const centers = clusterCentersRef;
            const meta = centers.get(expandedClusterRef);
            if (meta) {
                // Radius Check
                const distToCenter = Math.hypot(pointer.x - meta.centerX, pointer.y - meta.centerY);
                if (distToCenter <= meta.expandedRadius + hoverGraceDistance) {
                    isInsideRadius = true;
                }
            }
        }

        // Watchdog: If we are not hovering a node AND not in safe zone, and we are expanded, 
        // and no collapse is scheduled... we are stuck. Force collapse.
        if (!pointerOverNode && !isInsideRadius && expandedClusterRef && !collapseTimeout) {
            setExpandedCluster(null);
        }

        // Force visual fade update every frame to ensure consistency
        if ((pointerOverNode || isInsideRadius) && expandedClusterRef) {
            updateFade(expandedClusterRef);
        } else {
            updateFade(null);
        }
    };

    const handlePointerMove = (e: MouseEvent) => {
        // Simple throttle
        if (pointerMoveRaf) return;
        pointerMoveRaf = requestAnimationFrame(() => {
            pointerMoveRaf = null;
            handleInteraction(e);
        });
    };

    
    const handlePointerLeave = () => {
        pointerPosition = null;
        pendingPointerEvent = null;
        if (pointerMoveRaf) cancelAnimationFrame(pointerMoveRaf);
        setExpandedCluster(null);
    };

    graphContainer.addEventListener('mousemove', handlePointerMove);
    graphContainer.addEventListener('mouseleave', handlePointerLeave);

    return () => {
       if (cy) cy.destroy();
       graphContainer.removeEventListener('mousemove', handlePointerMove);
       graphContainer.removeEventListener('mouseleave', handlePointerLeave);
       containerRef.removeEventListener('mousedown', forceCursor);
       containerRef.removeEventListener('mouseup', forceCursor);
       containerRef.removeEventListener('click', forceCursor);
    };
  });

</script>

<div class="graph-wrapper" bind:this={containerRef}>
  <div class="graph-lane-labels" aria-hidden="true">
    {#each laneTracks as track}
      <span>
        <p>Pathway {track}</p>
        <small>{trackTitles.get(track) || ''}</small>
      </span>
    {/each}
  </div>

  <div class="graph-controls" aria-label="Graph controls">
    <button type="button" onclick={() => handleZoom(1.2)}>+</button>
    <button type="button" onclick={() => handleZoom(0.8)}>−</button>
    <button type="button" onclick={resetView}>Reset</button>
  </div>

  <div 
    bind:this={graphContainer} 
    style="width: 100%; height: {graphHeight}px; cursor: var(--cursor-paw);"
  ></div>

  {#if tooltip.visible}
    <div class="graph-tooltip" style:left="{tooltip.x}px" style:top="{tooltip.y}px">
      <p class="graph-tooltip__id">{tooltip.id}</p>
      <p class="graph-tooltip__title">{tooltip.title}</p>
      <p class="graph-tooltip__desc">{tooltip.description}</p>
      <p class="graph-tooltip__meta">
        {tooltip.status} · Spirit Level {tooltip.depthTarget}
      </p>
      <p class="graph-tooltip__delta">{tooltip.depthMessage}</p>
    </div>
  {/if}
</div>
