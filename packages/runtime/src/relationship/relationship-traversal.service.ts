import { Injectable, Logger } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import { RelationshipGraph } from './relationship-graph.js';
import type { RelationshipEdge, PathResult, CycleResult, RelationshipDirection } from './types.js';

@Injectable()
export class RelationshipTraversalService {
  private readonly logger = new Logger(RelationshipTraversalService.name);

  constructor(private readonly graph: RelationshipGraph) {}

  ancestors(entityId: EntityId, maxDepth: number = 100): RelationshipEdge[][] {
    const paths: RelationshipEdge[][] = [];
    this.dfsTraverse(entityId, [], paths, maxDepth, 0, 'incoming');
    return paths;
  }

  descendants(entityId: EntityId, maxDepth: number = 100): RelationshipEdge[][] {
    const paths: RelationshipEdge[][] = [];
    this.dfsTraverse(entityId, [], paths, maxDepth, 0, 'outgoing');
    return paths;
  }

  children(entityId: EntityId): RelationshipEdge[] {
    return this.graph.getOutgoingEdges(entityId);
  }

  parents(entityId: EntityId): RelationshipEdge[] {
    return this.graph.getIncomingEdges(entityId);
  }

  roots(): EntityId[] {
    return this.graph
      .getAllNodes()
      .filter(n => this.graph.getIncomingEdges(n.entityId).length === 0)
      .map(n => n.entityId);
  }

  leaves(): EntityId[] {
    return this.graph
      .getAllNodes()
      .filter(n => this.graph.getOutgoingEdges(n.entityId).length === 0)
      .map(n => n.entityId);
  }

  path(from: EntityId, to: EntityId): PathResult | undefined {
    const visited = new Set<string>();
    const queue: { entityId: EntityId; edges: RelationshipEdge[]; weight: number }[] = [
      { entityId: from, edges: [], weight: 0 },
    ];
    visited.add(from);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.entityId === to) {
        return {
          edges: current.edges,
          totalWeight: current.weight,
          nodeCount: current.edges.length + 1,
        };
      }
      for (const edge of this.graph.getOutgoingEdges(current.entityId)) {
        if (!visited.has(edge.targetId)) {
          visited.add(edge.targetId);
          queue.push({
            entityId: edge.targetId,
            edges: [...current.edges, edge],
            weight: current.weight + (edge.weight ?? 1),
          });
        }
      }
    }
    return undefined;
  }

  shortestPath(from: EntityId, to: EntityId): PathResult | undefined {
    return this.path(from, to);
  }

  allPaths(from: EntityId, to: EntityId, maxDepth: number = 10): PathResult[] {
    const results: PathResult[] = [];
    const explore = (
      currentId: EntityId,
      targetId: EntityId,
      path: RelationshipEdge[],
      depth: number,
      visited: Set<string>,
    ) => {
      if (depth > maxDepth) return;
      if (currentId === targetId && path.length > 0) {
        results.push({
          edges: [...path],
          totalWeight: path.reduce((sum, e) => sum + (e.weight ?? 1), 0),
          nodeCount: path.length + 1,
        });
        return;
      }
      for (const edge of this.graph.getOutgoingEdges(currentId)) {
        if (!visited.has(edge.targetId)) {
          visited.add(edge.targetId);
          explore(edge.targetId, targetId, [...path, edge], depth + 1, visited);
          visited.delete(edge.targetId);
        }
      }
    };
    const visited = new Set<string>();
    visited.add(from);
    explore(from, to, [], 0, visited);
    return results;
  }

  bfs(startId: EntityId, visit: (entityId: EntityId, depth: number) => void): void {
    const visited = new Set<string>();
    const queue: { entityId: EntityId; depth: number }[] = [{ entityId: startId, depth: 0 }];
    visited.add(startId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      visit(current.entityId, current.depth);
      for (const edge of this.graph.getOutgoingEdges(current.entityId)) {
        if (!visited.has(edge.targetId)) {
          visited.add(edge.targetId);
          queue.push({ entityId: edge.targetId, depth: current.depth + 1 });
        }
      }
    }
  }

  dfs(startId: EntityId, visit: (entityId: EntityId, depth: number) => void): void {
    const visited = new Set<string>();
    const stack: { entityId: EntityId; depth: number }[] = [{ entityId: startId, depth: 0 }];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current.entityId)) continue;
      visited.add(current.entityId);
      visit(current.entityId, current.depth);
      for (const edge of this.graph.getOutgoingEdges(current.entityId)) {
        if (!visited.has(edge.targetId)) {
          stack.push({ entityId: edge.targetId, depth: current.depth + 1 });
        }
      }
    }
  }

  reachableNodes(startId: EntityId, maxDepth: number = 10): EntityId[] {
    const result: EntityId[] = [];
    this.bfs(startId, (id, depth) => {
      if (depth > 0 && depth <= maxDepth) {
        result.push(id);
      }
    });
    return result;
  }

  detectCycles(): CycleResult {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: RelationshipEdge[][] = [];
    const edgeStack: RelationshipEdge[] = [];

    const dfs = (nodeId: string) => {
      if (recursionStack.has(nodeId)) {
        const cycleStartIndex = edgeStack.findIndex(
          e => e.targetId === nodeId || e.sourceId === nodeId,
        );
        if (cycleStartIndex >= 0) {
          cycles.push([...edgeStack.slice(cycleStartIndex)]);
        }
        return;
      }
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      recursionStack.add(nodeId);
      for (const edge of this.graph.getOutgoingEdges(nodeId as EntityId)) {
        edgeStack.push(edge);
        dfs(edge.targetId);
        edgeStack.pop();
      }
      recursionStack.delete(nodeId);
    };

    for (const node of this.graph.getAllNodes()) {
      if (!visited.has(node.entityId)) {
        dfs(node.entityId);
      }
    }

    return {
      hasCycles: cycles.length > 0,
      cycles: cycles.length > 0 ? cycles : undefined,
    };
  }

  private dfsTraverse(
    entityId: EntityId,
    currentPath: RelationshipEdge[],
    paths: RelationshipEdge[][],
    maxDepth: number,
    depth: number,
    direction: RelationshipDirection,
  ): void {
    if (depth >= maxDepth) return;
    const edges = direction === 'incoming'
      ? this.graph.getIncomingEdges(entityId)
      : this.graph.getOutgoingEdges(entityId);
    for (const edge of edges) {
      const nextId = direction === 'incoming' ? edge.sourceId : edge.targetId;
      const newPath = [...currentPath, edge];
      paths.push(newPath);
      this.dfsTraverse(nextId, newPath, paths, maxDepth, depth + 1, direction);
    }
  }
}
