import { describe, it, expect, beforeEach } from 'vitest';
import type { EntityId } from '@storynaram/core';
import { RelationshipGraph } from '../src/relationship/relationship-graph';
import { RelationshipTraversalService } from '../src/relationship/relationship-traversal.service';
import { RelationshipQueryService } from '../src/relationship/relationship-query.service';

function id(value: string): EntityId {
  return value as EntityId;
}

describe('Query Relationship Integration', () => {
  let graph: RelationshipGraph;
  let traversal: RelationshipTraversalService;
  let queryService: RelationshipQueryService;

  beforeEach(() => {
    graph = new RelationshipGraph();
    traversal = new RelationshipTraversalService(graph);
    queryService = new RelationshipQueryService(graph);
    graph.addNode({ entityId: id('alice'), entityType: 'character' });
    graph.addNode({ entityId: id('bob'), entityType: 'character' });
    graph.addNode({ entityId: id('charlie'), entityType: 'character' });
    graph.addNode({ entityId: id('world'), entityType: 'world' });
    graph.addNode({ entityId: id('item'), entityType: 'item' });
    graph.addEdge(id('alice'), id('bob'), 'knows', 'friend');
    graph.addEdge(id('bob'), id('charlie'), 'knows', 'friend');
    graph.addEdge(id('alice'), id('world'), 'owns', 'home');
    graph.addEdge(id('bob'), id('item'), 'owns', 'treasure');
    graph.addEdge(id('charlie'), id('item'), 'owns', 'treasure');
  });

  it('should traverse parents', () => {
    const parents = traversal.parents(id('bob'));
    expect(parents).toHaveLength(1);
    expect(parents[0]!.sourceId).toBe(id('alice'));
  });

  it('should traverse children', () => {
    const children = traversal.children(id('alice'));
    expect(children).toHaveLength(2);
  });

  it('should find ancestors', () => {
    const ancestors = traversal.ancestors(id('charlie'));
    const allIds = ancestors.flat().map(e => e.sourceId);
    expect(allIds).toContain(id('alice'));
    expect(allIds).toContain(id('bob'));
  });

  it('should find descendants', () => {
    const descendants = traversal.descendants(id('alice'));
    const allIds = descendants.flat().map(e => e.targetId);
    expect(allIds).toContain(id('bob'));
    expect(allIds).toContain(id('charlie'));
    expect(allIds).toContain(id('world'));
  });

  it('should find roots', () => {
    const roots = traversal.roots();
    expect(roots).toContain(id('alice'));
  });

  it('should find leaves', () => {
    const leaves = traversal.leaves();
    expect(leaves).toContain(id('world'));
    expect(leaves).toContain(id('item'));
    expect(leaves).not.toContain(id('charlie'));
  });

  it('should find path', () => {
    const result = traversal.path(id('alice'), id('charlie'));
    expect(result).toBeDefined();
    expect(result!.edges.length).toBe(2);
    expect(result!.nodeCount).toBe(3);
  });

  it('should find shortest path', () => {
    const result = traversal.shortestPath(id('alice'), id('charlie'));
    expect(result).toBeDefined();
    expect(result!.edges.length).toBe(2);
  });

  it('should detect no cycles normally', () => {
    const result = traversal.detectCycles();
    expect(result.hasCycles).toBe(false);
  });

  it('should detect cycles when present', () => {
    graph.addEdge(id('charlie'), id('alice'), 'knows', 'friend');
    const result = traversal.detectCycles();
    expect(result.hasCycles).toBe(true);
  });

  it('should find reachable nodes', () => {
    const reachable = traversal.reachableNodes(id('alice'), 2);
    expect(reachable).toContain(id('bob'));
    expect(reachable).toContain(id('charlie'));
    expect(reachable).toContain(id('world'));
    expect(reachable).toContain(id('item'));
  });

  it('should find relations by filter', () => {
    const edges = queryService.findRelations({ sourceId: id('alice') });
    expect(edges).toHaveLength(2);
  });

  it('should find incoming edges', () => {
    const edges = queryService.findIncoming(id('bob'));
    expect(edges).toHaveLength(1);
    expect(edges[0]!.sourceId).toBe(id('alice'));
  });

  it('should find outgoing edges', () => {
    const edges = queryService.findOutgoing(id('bob'));
    expect(edges).toHaveLength(2);
  });

  it('should find by type', () => {
    const edges = queryService.findByType('owns' as any);
    expect(edges).toHaveLength(3);
  });

  it('should search relationships', () => {
    const result = queryService.search({ types: ['knows' as any] });
    expect(result.total).toBe(2);
  });

  it('should compute connected components', () => {
    const allNodes = graph.getAllNodes();
    const visited = new Set<string>();
    const components: Array<{ id: number; nodes: EntityId[]; size: number }> = [];
    let componentId = 0;

    for (const node of allNodes) {
      if (visited.has(node.entityId)) continue;
      const component: EntityId[] = [];
      const stack: string[] = [node.entityId];
      while (stack.length > 0) {
        const current = stack.pop()!;
        if (visited.has(current)) continue;
        visited.add(current);
        component.push(current as EntityId);
        for (const neighbor of graph.getNeighbors(current as EntityId)) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        }
      }
      components.push({ id: componentId++, nodes: component, size: component.length });
    }

    expect(components.length).toBe(1);
    expect(components[0]!.size).toBe(5);
  });

  it('should compute subgraph', () => {
    const depth = 1;
    const visited = new Set<string>();
    const edges: Array<{ source: EntityId; target: EntityId; type: string }> = [];
    const queue = [{ id: id('alice'), currentDepth: 0 }];
    visited.add(id('alice'));

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.currentDepth >= depth) continue;
      for (const edge of graph.getOutgoingEdges(current.id)) {
        edges.push({ source: edge.sourceId, target: edge.targetId, type: edge.type });
        if (!visited.has(edge.targetId)) {
          visited.add(edge.targetId);
          queue.push({ id: edge.targetId, currentDepth: current.currentDepth + 1 });
        }
      }
      for (const edge of graph.getIncomingEdges(current.id)) {
        edges.push({ source: edge.sourceId, target: edge.targetId, type: edge.type });
        if (!visited.has(edge.sourceId)) {
          visited.add(edge.sourceId);
          queue.push({ id: edge.sourceId, currentDepth: current.currentDepth + 1 });
        }
      }
    }

    expect(visited.size).toBe(3);
    expect(edges.length).toBe(2);
  });
});
