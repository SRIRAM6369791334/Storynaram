export interface GraphNode {
  id: string;
  type: string;
  domain: string;
  label: string;
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  label: string;
  weight: number;
}

export class GraphTraversal {
  findPaths(
    nodes: GraphNode[],
    edges: GraphEdge[],
    startId: string,
    endId: string,
    maxDepth: number = 10,
  ): GraphNode[][] {
    const adjacency = this.buildAdjacency(edges);
    const paths: GraphNode[][] = [];
    const visited = new Set<string>();

    const dfs = (currentId: string, path: GraphNode[], depth: number) => {
      if (depth > maxDepth) return;
      if (currentId === endId && path.length > 0) {
        paths.push([...path]);
        return;
      }
      if (visited.has(currentId)) return;
      visited.add(currentId);

      const current = nodes.find(n => n.id === currentId);
      if (current) path.push(current);

      const neighbors = adjacency.get(currentId) ?? [];
      for (const neighborId of neighbors) {
        dfs(neighborId, [...path], depth + 1);
      }

      visited.delete(currentId);
    };

    dfs(startId, [], 0);
    return paths;
  }

  findReachableNodes(
    nodes: GraphNode[],
    edges: GraphEdge[],
    startId: string,
    maxDepth: number = 5,
  ): Map<string, number> {
    const adjacency = this.buildAdjacency(edges);
    const reachable = new Map<string, number>();
    const visited = new Set<string>();

    const dfs = (currentId: string, depth: number) => {
      if (depth > maxDepth) return;
      if (visited.has(currentId)) return;
      visited.add(currentId);
      if (currentId !== startId) {
        reachable.set(currentId, depth);
      }

      const neighbors = adjacency.get(currentId) ?? [];
      for (const neighborId of neighbors) {
        dfs(neighborId, depth + 1);
      }
    };

    dfs(startId, 0);
    return reachable;
  }

  findNeighbors(
    nodeId: string,
    edges: GraphEdge[],
    direction: 'outgoing' | 'incoming' | 'both' = 'both',
  ): string[] {
    return edges
      .filter(e => {
        if (direction === 'outgoing') return e.source === nodeId;
        if (direction === 'incoming') return e.target === nodeId;
        return e.source === nodeId || e.target === nodeId;
      })
      .map(e => (e.source === nodeId ? e.target : e.source));
  }

  shortestPath(
    nodes: GraphNode[],
    edges: GraphEdge[],
    startId: string,
    endId: string,
  ): GraphNode[] | null {
    const adjacency = this.buildWeightedAdjacency(edges);
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unvisited = new Set<string>();

    for (const node of nodes) {
      distances.set(node.id, Infinity);
      previous.set(node.id, null);
      unvisited.add(node.id);
    }
    distances.set(startId, 0);

    while (unvisited.size > 0) {
      let current: string | null = null;
      let minDist = Infinity;
      for (const id of unvisited) {
        const d = distances.get(id) ?? Infinity;
        if (d < minDist) {
          minDist = d;
          current = id;
        }
      }
      if (current === null || current === endId) break;
      unvisited.delete(current);

      const neighbors = adjacency.get(current) ?? [];
      for (const [neighbor, weight] of neighbors) {
        if (!unvisited.has(neighbor)) continue;
        const alt = (distances.get(current) ?? Infinity) + weight;
        if (alt < (distances.get(neighbor) ?? Infinity)) {
          distances.set(neighbor, alt);
          previous.set(neighbor, current);
        }
      }
    }

    if (distances.get(endId) === Infinity) return null;

    const path: GraphNode[] = [];
    let current: string | null = endId;
    while (current !== null) {
      const node = nodes.find(n => n.id === (current as string));
      if (node) path.unshift(node);
      current = previous.get(current as string) ?? null;
    }
    return path;
  }

  private buildAdjacency(edges: GraphEdge[]): Map<string, string[]> {
    const adj = new Map<string, string[]>();
    for (const edge of edges) {
      const outgoing = adj.get(edge.source) ?? [];
      outgoing.push(edge.target);
      adj.set(edge.source, outgoing);

      const incoming = adj.get(edge.target) ?? [];
      incoming.push(edge.source);
      adj.set(edge.target, incoming);
    }
    return adj;
  }

  private buildWeightedAdjacency(edges: GraphEdge[]): Map<string, Array<[string, number]>> {
    const adj = new Map<string, Array<[string, number]>>();
    for (const edge of edges) {
      const outgoing = adj.get(edge.source) ?? [];
      outgoing.push([edge.target, edge.weight]);
      adj.set(edge.source, outgoing);
    }
    return adj;
  }
}
