import { GraphEdge } from './graph-traversal.js';

export interface CycleResult {
  hasCycle: boolean;
  cycles: string[][];
  involvedNodes: string[];
}

export class CycleDetection {
  detect(edges: GraphEdge[]): CycleResult {
    const adjacency = this.buildDirectedAdjacency(edges);
    const allNodes = this.getAllNodes(edges);
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const cycles: string[][] = [];
    const path: string[] = [];

    const dfs = (node: string): void => {
      if (recStack.has(node)) {
        const cycleStart = path.indexOf(node);
        if (cycleStart >= 0) {
          cycles.push([...path.slice(cycleStart), node]);
        }
        return;
      }
      if (visited.has(node)) return;

      visited.add(node);
      recStack.add(node);
      path.push(node);

      const neighbors = adjacency.get(node) ?? [];
      for (const neighbor of neighbors) {
        dfs(neighbor);
      }

      path.pop();
      recStack.delete(node);
    };

    for (const node of allNodes) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    const involvedNodes = [...new Set(cycles.flat())];

    return {
      hasCycle: cycles.length > 0,
      cycles,
      involvedNodes,
    };
  }

  detectBetween(edges: GraphEdge[], nodeIds: string[]): CycleResult {
    const filteredEdges = edges.filter(
      e => nodeIds.includes(e.source) && nodeIds.includes(e.target),
    );
    return this.detect(filteredEdges);
  }

  private buildDirectedAdjacency(edges: GraphEdge[]): Map<string, string[]> {
    const adj = new Map<string, string[]>();
    for (const edge of edges) {
      const outgoing = adj.get(edge.source) ?? [];
      outgoing.push(edge.target);
      adj.set(edge.source, outgoing);
    }
    return adj;
  }

  private getAllNodes(edges: GraphEdge[]): string[] {
    const nodes = new Set<string>();
    for (const edge of edges) {
      nodes.add(edge.source);
      nodes.add(edge.target);
    }
    return Array.from(nodes);
  }
}
