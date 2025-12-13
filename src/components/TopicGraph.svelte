<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import cytoscape, { type Core, type EventObjectNode, type Stylesheet, type ElementDefinition } from 'cytoscape';
  import type { Topic } from '../types';
  import { deriveDepthDelta, depthDeltaMessage } from '../utils/depth';

  interface Props {
    topics: Topic[];
    highlightedIds: Set<string>;
    focusedTopicId?: string | null;
    onSelectTopic?: (topicId: string) => void;
    searchTerm?: string;
  }

  let { 
    topics, 
    highlightedIds, 
    focusedTopicId = null, 
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
  let collapseTimeout: ReturnType<typeof setTimeout> | null = null;
  let idleCollapseTimeout: ReturnType<typeof setTimeout> | null = null;
  let prevExpandedCluster: string | null = null;
  let pointerInsideCluster = false;
  let pointerOverNode = false; // New flag to track direct node interaction
  let pointerPosition: { x: number; y: number } | null = null;
  let lastPointerCluster: string | null = null;
  let pointerMoveRaf: number | null = null;
  let pendingPointerEvent: MouseEvent | null = null;
  let reconcileRaf: number | null = null;
  let initialFitDone = false;
  let clusterCentersRef: Map<string, any> = new Map();
  let expandedClusterRef: string | null = null;

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
    console.log('GraphData Calc: Topics count:', topics.length);
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
      const holdRadius = expansionDistance + 20;
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
          'transition-property': 'background-color, border-width, border-color, opacity',
          'transition-duration': 320, 'transition-timing-function': 'ease-in-out',
          'z-index-compare': 'manual', 'z-index': 2,
        }
      },
      { selector: 'node.cluster-expanded', style: { 'z-index': 999 } },
      { selector: 'node.neighbor-repelled', style: { opacity: 0.18 } },
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
  function queueCollapse() {
    if (collapseTimeout) return;
    collapseTimeout = setTimeout(() => {
      const currentKey = expandedClusterRef;
      const pointer = pointerPosition;
      const centers = clusterCentersRef;
      let shouldCollapse = !pointerInsideCluster;

      if (currentKey && pointer) {
        const meta = centers.get(currentKey);
        if (meta) {
          const dist = Math.hypot(pointer.x - meta.centerX, pointer.y - meta.centerY);
          if (dist <= meta.expandedRadius + hoverGraceDistance) shouldCollapse = false;
        }
      }

      if (shouldCollapse) {
        expandedCluster = null;
        lastPointerCluster = null;
      }
      collapseTimeout = null;
    }, collapseDelayMs);
  }

  // Effect: Update refs for logic loop
  $effect(() => {
    clusterCentersRef = graphData.clusterCenters;
    expandedClusterRef = expandedCluster;
  });

  // Effect: Idle collapse
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
      if (dist > meta.expandedRadius + hoverGraceDistance) {
        pointerInsideCluster = false;
        lastPointerCluster = null;
        expandedCluster = null;
      }
    }, collapseDelayMs);
  });

  // Effect 1: Data Synchronization
  $effect(() => {
    if (!cy) return;
    const { elements } = graphData;
    console.log('Data Sync Effect running. Elements:', elements.length);

    if (elements.length === 0 && cy.nodes().length > 0) {
        console.warn('Skipping graph update: incoming data is empty.');
        return; 
    }
    
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

  // Effect 2: Animation Loop (Ripple & Expand)
  $effect(() => {
    if (!cy) return;
    
    const current = expandedCluster; 
    const previous = prevExpandedCluster; 
    
    const escapeSelector = (str: string) => str.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');

    // 1. Reconcile Helper (Matches React logic)
    const reconcileNeighborFade = (key: string | null) => {
      if (!key) {
        cy!.nodes('.neighbor-repelled').removeClass('neighbor-repelled');
        return;
      }
      const selector = `[clusterKey = "${escapeSelector(key)}"]`;
      const clusterNodes = cy!.nodes(selector);
      
      if (clusterNodes.length === 0) {
        cy!.nodes('.neighbor-repelled').removeClass('neighbor-repelled');
        return;
      }

      const otherNodes = cy!.nodes().difference(clusterNodes);
      otherNodes.filter((n: any) => !n.hasClass('neighbor-repelled')).addClass('neighbor-repelled');
      clusterNodes.filter((n: any) => n.hasClass('neighbor-repelled')).removeClass('neighbor-repelled');
    };

    // 2. Cleanup Helper
    const cleanupReconcileFade = () => {
      if (reconcileRaf !== null) {
        cancelAnimationFrame(reconcileRaf);
        reconcileRaf = null;
      }
    };

    // 3. Scheduler (Double RAF to wait for paint)
    const scheduleReconcileFade = (key: string | null) => {
      if (reconcileRaf !== null) {
        cancelAnimationFrame(reconcileRaf);
      }
      reconcileRaf = requestAnimationFrame(() => {
        reconcileRaf = requestAnimationFrame(() => {
          reconcileRaf = null;
          reconcileNeighborFade(key);
        });
      });
    };

    const applyRipple = (key: string, expand: boolean, affectedNodes: any) => {
      const meta = clusterCentersRef.get(key);
      if (!meta) return;
      const safeZone = meta.expandedRadius + 60;
      const rippleFalloffZone = 200;
      const rippleReach = safeZone + rippleFalloffZone + 120;

      affectedNodes.forEach((node: any) => {
        const baseX = Number(node.data('baseX'));
        const baseY = Number(node.data('baseY'));
        const dx = baseX - meta.centerX;
        const dy = baseY - meta.centerY;
        const distance = Math.hypot(dx, dy) || 1;

        if (!expand) {
          const pos = node.position();
          const offsetFromBase = Math.hypot(pos.x - baseX, pos.y - baseY);
          if (offsetFromBase < 0.75) return;
          node.animate({ position: { x: baseX, y: baseY } }, { duration: distance > rippleReach ? 160 : 220, easing: distance > rippleReach ? 'ease-out' : 'ease-in-out', queue: false });
          return;
        }

        if (distance > rippleReach) return;
        let targetX = baseX, targetY = baseY;
        if (distance < safeZone) {
          const pushFactor = safeZone / distance;
          targetX = meta.centerX + dx * pushFactor * 1.05;
          targetY = meta.centerY + dy * pushFactor * 1.05;
        } else if (distance < safeZone + rippleFalloffZone) {
          const proximity = 1 - ((distance - safeZone) / rippleFalloffZone);
          const nudge = proximity * 60;
          const scale = (distance + nudge) / distance;
          targetX = meta.centerX + dx * scale;
          targetY = meta.centerY + dy * scale;
        }
        
        const pos = node.position();
        if (Math.hypot(pos.x - targetX, pos.y - targetY) < 0.9 && !node.animated()) return;
        node.animate({ position: { x: targetX, y: targetY } }, { duration: 300, easing: 'ease-in-out', queue: false });
      });
    };

    const animateCluster = (key: string | null, expand: boolean, fadeNeighbors: boolean) => {
      if (!key) return;
      const selector = `[clusterKey = "${escapeSelector(key)}"]`;
      const nodes = cy!.nodes(selector);
      if (expand && nodes.length === 0) {
        cy!.nodes().removeClass('neighbor-repelled');
        return;
      }
      
      nodes.stop(true);
      if (expand) nodes.removeClass('neighbor-repelled');
      
      nodes.forEach((node: any) => {
        const targetX = expand ? Number(node.data('expandedX')) : Number(node.data('baseX'));
        const targetY = expand ? Number(node.data('expandedY')) : Number(node.data('baseY'));
        if (expand) node.addClass('cluster-expanded'); else node.removeClass('cluster-expanded');
        node.animate({ position: { x: targetX, y: targetY } }, { duration: expand ? 260 : 180, easing: 'ease-in-out', queue: false });
      });

      const otherNodes = cy!.nodes().difference(nodes);
      // Immediate fade class toggle based on flag, but reconciled later
      if (fadeNeighbors) otherNodes.addClass('neighbor-repelled'); else otherNodes.removeClass('neighbor-repelled');

      if (expand) {
        const meta = clusterCentersRef.get(key);
        if (!meta) return;
        const rippleReach = meta.expandedRadius + 60 + 200 + 120;
        const rippleNodes = otherNodes.filter((node: any) => {
           const dx = Number(node.data('baseX')) - meta.centerX;
           const dy = Number(node.data('baseY')) - meta.centerY;
           return (Math.hypot(dx, dy) || 1) <= rippleReach;
        });
        applyRipple(key, true, rippleNodes);
      } else {
        applyRipple(key, false, otherNodes);
      }
    };

    if (previous && previous !== current) {
      if (current) {
        // Switched from one cluster to another directly
        const prevSelector = `[clusterKey = "${escapeSelector(previous)}"]`;
        cy!.nodes(prevSelector).removeClass('cluster-expanded');
        animateCluster(current, true, true);
        
        const meta = clusterCentersRef.get(current);
        if (meta) {
           const selector = `[clusterKey = "${escapeSelector(current)}"]`;
           const nextNodes = cy!.nodes(selector);
           const farNodes = cy!.nodes().difference(nextNodes).filter((n:any) => {
             const dx = Number(n.data('baseX')) - meta.centerX;
             const dy = Number(n.data('baseY')) - meta.centerY;
             return Math.hypot(dx, dy) > (meta.expandedRadius + 380);
           });
           applyRipple(current, false, farNodes);
        }
        prevExpandedCluster = current;
        scheduleReconcileFade(current);
        return cleanupReconcileFade; // Return cleanup function
      }
      
      // Collapsed to null
      animateCluster(previous, false, false);
      prevExpandedCluster = current;
      scheduleReconcileFade(null);
      return cleanupReconcileFade;
    }
    
    // Initial expand or data reload
    if (current) {
      animateCluster(current, true, true);
    }
    prevExpandedCluster = current;
    scheduleReconcileFade(current);
    
    return cleanupReconcileFade;
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
      pointerOverNode = true;
      const pos = e.renderedPosition;
      const coords = clampTooltipCoords(pos.x + 10, pos.y + 10);
      const d = e.target.data();
      tooltip = {
        visible: true, x: coords.x, y: coords.y,
        id: d.id, title: d.label, description: d.description,
        status: d.status, depthTarget: d.depthTarget || '—', depthMessage: d.depthMessage || ''
      };
      const key = d.clusterKey;
      if (key) {
        if (collapseTimeout) clearTimeout(collapseTimeout);
        pointerInsideCluster = true;
        expandedCluster = key;
      }
    });

    // Optimized MouseOut
    cy.on('mouseout', 'node', (e: EventObjectNode) => {
      pointerOverNode = false;
      tooltip.visible = false;
      const key = e.target.data('clusterKey');
      if (collapseTimeout) clearTimeout(collapseTimeout);
      if (key) {
        if (pointerPosition && expandedCluster === key) {
           const meta = clusterCentersRef.get(key);
           if (meta) {
              const dist = Math.hypot(pointerPosition.x - meta.centerX, pointer.y - meta.centerY);
              if (dist <= meta.expandedRadius + hoverGraceDistance) {
                 pointerInsideCluster = true;
                 return;
              }
           }
        }
        pointerInsideCluster = false;
      }
      queueCollapse();
    });

    // Optimized Pointer Move Logic
    const processPointerMove = (event: MouseEvent) => {
        if (!cy) return;
        
        if (pointerOverNode && expandedClusterRef) return;

        const renderer = (cy as any).renderer();
        let pointer = { x: 0, y: 0 };
        if (renderer && renderer.projectIntoViewport) {
           const [x, y] = renderer.projectIntoViewport(event.clientX, event.clientY);
           pointer = { x, y };
        } else {
           const rect = graphContainer.getBoundingClientRect();
           const zoom = cy.zoom();
           const pan = cy.pan();
           pointer = { x: (event.clientX - rect.left - pan.x) / zoom, y: (event.clientY - rect.top - pan.y) / zoom };
        }
        pointerPosition = pointer;
        
        const centers = clusterCentersRef;
        const chooseCluster = (key: string | null) => {
            if (key) {
                pointerInsideCluster = true;
                if (lastPointerCluster !== key) {
                    lastPointerCluster = key;
                    expandedCluster = key;
                }
                if (collapseTimeout) clearTimeout(collapseTimeout);
            } else {
                if (!pointerOverNode) {
                    pointerInsideCluster = false;
                    lastPointerCluster = null;
                    queueCollapse();
                }
            }
        };

        const currentKey = expandedClusterRef;
        if (currentKey) {
            const meta = centers.get(currentKey);
            if (meta) {
                const dist = Math.hypot(pointer.x - meta.centerX, pointer.y - meta.centerY);
                if (dist <= meta.expandedRadius + hoverGraceDistance) {
                    chooseCluster(currentKey);
                    return;
                }
            }
        }

        let targetKey: string | null = null;
        let nearestDist = Infinity;
        
        for (const [key, meta] of centers.entries()) {
             const dist = Math.hypot(pointer.x - meta.centerX, pointer.y - meta.centerY);
             if (dist <= meta.baseRadius + hoverGraceDistance && dist < nearestDist) {
                 nearestDist = dist;
                 targetKey = key;
             }
        }
        
        chooseCluster(targetKey);
    };

    const handlePointerMove = (e: MouseEvent) => {
        pendingPointerEvent = e;
        if (pointerMoveRaf) return;
        pointerMoveRaf = requestAnimationFrame(() => {
            pointerMoveRaf = null;
            if (pendingPointerEvent) processPointerMove(pendingPointerEvent);
        });
    };
    
    const handlePointerLeave = () => {
        pointerPosition = null;
        pendingPointerEvent = null;
        if (pointerMoveRaf) cancelAnimationFrame(pointerMoveRaf);
        pointerInsideCluster = false;
        lastPointerCluster = null;
        queueCollapse();
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
