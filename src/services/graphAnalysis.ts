import type { Core, CollectionReturnValue } from 'cytoscape';

/**
 * Calculates the "Quest Path" (Ley Lines) for a given target topic.
 * This identifies all prerequisite nodes (ancestors) and the edges connecting them.
 * 
 * @param cy The Cytoscape core instance containing the full graph.
 * @param targetId The ID of the topic we want to reach.
 * @returns A set of Node IDs and Edge IDs that form the Critical Path.
 */
export function findQuestPath(cy: Core, targetId: string) {
  const result = {
    nodeIds: new Set<string>(),
    edgeIds: new Set<string>()
  };

  const target = cy.getElementById(targetId);
  if (target.empty()) return result;

  // Add the target itself
  result.nodeIds.add(targetId);

  // Find all ancestors (predecessors)
  // predecessors() returns both nodes and edges in the upstream path
  const ancestors: CollectionReturnValue = target.predecessors();

  ancestors.forEach(ele => {
    if (ele.isNode()) {
      result.nodeIds.add(ele.id());
    } else if (ele.isEdge()) {
      result.edgeIds.add(ele.id());
    }
  });

  return result;
}

/**
 * Calculates centrality (PageRank) to identify "Keystone" nodes.
 * Assigns 'centralityScore' (0-1) and 'isKeystone' (boolean) to node data.
 * 
 * @param cy The Cytoscape core instance.
 * @param threshold The percentile (0-1) required to be a keystone (e.g. top 10% = 0.9).
 */
export function calculateCentrality(cy: Core, threshold = 0.85) {
  const pr = cy.elements().pageRank({
    dampingFactor: 0.85,
    precision: 0.001
  });

  const nodes = cy.nodes();
  if (nodes.length === 0) return;

  // 1. Calculate and Normalize Scores
  let min = 1, max = 0;
  const rawScores = new Map<string, number>();

  nodes.forEach(n => {
    const score = pr.rank(n);
    rawScores.set(n.id(), score);
    if (score < min) min = score;
    if (score > max) max = score;
  });

  const range = max - min || 1;

  // 2. Assign Data
  nodes.batch(() => {
    nodes.forEach(n => {
      const raw = rawScores.get(n.id()) || 0;
      const normalized = (raw - min) / range;
      n.data('centralityScore', normalized);
      n.data('isKeystone', normalized >= threshold);
    });
  });
}

/**
 * Detects communities using a simple Label Propagation Algorithm (LPA).
 * Assigns a 'communityColor' to each node based on its group.
 * 
 * @param cy The Cytoscape core instance.
 */
export function detectCommunities(cy: Core) {
  const nodes = cy.nodes();
  if (nodes.length === 0) return;

  // 1. Initialize: Every node has its own unique label
  const labels = new Map<string, string>();
  nodes.forEach(n => labels.set(n.id(), n.id()));

  // 2. Propagation Loop (Run fixed iterations for stability)
  const iterations = 5; 
  for (let i = 0; i < iterations; i++) {
    // Shuffle processing order to prevent oscillation
    const shuffled = [...nodes].sort(() => Math.random() - 0.5);
    
    let changed = false;
    shuffled.forEach(node => {
      const neighbors = node.neighborhood().nodes();
      if (neighbors.length === 0) return;

      // Count neighbor labels
      const counts = new Map<string, number>();
      neighbors.forEach(neighbor => {
        const lbl = labels.get(neighbor.id());
        if (lbl) counts.set(lbl, (counts.get(lbl) || 0) + 1);
      });

      // Find dominant label
      let max = 0;
      let dominant = labels.get(node.id())!; // Default to self
      
      counts.forEach((count, lbl) => {
        if (count > max) {
          max = count;
          dominant = lbl;
        } else if (count === max) {
          // Tie-break: Prefer current label to reduce jitter
          if (lbl === labels.get(node.id())) dominant = lbl;
        }
      });

      if (dominant !== labels.get(node.id())) {
        labels.set(node.id(), dominant);
        changed = true;
      }
    });
    
    if (!changed) break; // Converged
  }

  // 3. Assign Colors
  // Generate a stable color for each community label
  const communityColors = new Map<string, string>();
  const palette = [
    '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', 
    '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', 
    '#fffffc', '#e4c1f9'
  ]; // Pastel Rainbow

  let colorIdx = 0;
  
  cy.batch(() => {
    nodes.forEach(n => {
      const label = labels.get(n.id())!;
      if (!communityColors.has(label)) {
        communityColors.set(label, palette[colorIdx % palette.length]);
        colorIdx++;
      }
      n.data('communityColor', communityColors.get(label));
    });
  });
}
