import { describe, it, expect, beforeEach } from 'vitest';
import type { EntityId } from '@storynaram/core';
import { RelationshipGraph } from '../src/relationship/relationship-graph';
import { RelationshipTraversalService } from '../src/relationship/relationship-traversal.service';

function id(value: string): EntityId {
  return value as EntityId;
}

describe('RelationshipTraversalService', () => {
  let graph: RelationshipGraph;
  let traversal: RelationshipTraversalService;

  function edge(a: string, b: string, type = 'directed', label?: string): void {
    graph.addEdge(id(a), id(b), type as any, label);
  }

  beforeEach(() => {
    graph = new RelationshipGraph();
    traversal = new RelationshipTraversalService(graph);
  });

  describe('tree graph', () => {
    beforeEach(() => {
      edge('root', 'child1', 'hierarchical');
      edge('root', 'child2', 'hierarchical');
      edge('child1', 'grandchild1', 'hierarchical');
      edge('child1', 'grandchild2', 'hierarchical');
    });

    it('children', () => {
      const kids = traversal.children(id('root'));
      expect(kids.length).toBe(2);
    });

    it('parents', () => {
      const parents = traversal.parents(id('grandchild1'));
      expect(parents.length).toBe(1);
    });

    it('roots', () => {
      const roots = traversal.roots();
      expect(roots).toContain(id('root'));
    });

    it('leaves', () => {
      const leafs = traversal.leaves();
      expect(leafs).toContain(id('grandchild1'));
      expect(leafs).toContain(id('grandchild2'));
      expect(leafs).toContain(id('child2'));
    });

    it('ancestors', () => {
      const ancestors = traversal.ancestors(id('grandchild1'));
      expect(ancestors.length).toBeGreaterThan(0);
    });

    it('descendants', () => {
      const descendants = traversal.descendants(id('root'));
      expect(descendants.length).toBeGreaterThan(0);
    });
  });

  describe('path finding', () => {
    beforeEach(() => {
      edge('a', 'b');
      edge('b', 'c');
      edge('c', 'd');
      edge('a', 'c'); // shortcut
    });

    it('should find path between connected nodes', () => {
      const result = traversal.path(id('a'), id('d'));
      expect(result).toBeDefined();
      expect(result!.nodeCount).toBeGreaterThanOrEqual(2);
    });

    it('should return undefined for disconnected nodes', () => {
      const result = traversal.path(id('a'), id('x'));
      expect(result).toBeUndefined();
    });

    it('shortestPath', () => {
      const result = traversal.shortestPath(id('a'), id('d'));
      expect(result).toBeDefined();
      expect(result!.nodeCount).toBe(3); // a -> c -> d
    });

    it('allPaths', () => {
      const results = traversal.allPaths(id('a'), id('d'));
      expect(results.length).toBe(2); // a->b->c->d and a->c->d
    });
  });

  describe('BFS and DFS', () => {
    beforeEach(() => {
      edge('a', 'b');
      edge('a', 'c');
      edge('b', 'd');
      edge('c', 'd');
    });

    it('BFS visits in order', () => {
      const visited: string[] = [];
      traversal.bfs(id('a'), (entityId) => { visited.push(entityId); });
      expect(visited[0]).toBe('a');
      expect(visited).toContain('b');
      expect(visited).toContain('c');
      expect(visited).toContain('d');
    });

    it('DFS visits all', () => {
      const visited: string[] = [];
      traversal.dfs(id('a'), (entityId) => { visited.push(entityId); });
      expect(visited.length).toBe(4);
    });
  });

  describe('reachableNodes', () => {
    it('should find all reachable nodes within depth', () => {
      edge('a', 'b');
      edge('b', 'c');
      edge('c', 'd');
      const reachable = traversal.reachableNodes(id('a'), 2);
      expect(reachable).toContain(id('b'));
      expect(reachable).toContain(id('c'));
      expect(reachable).not.toContain(id('d'));
    });
  });

  describe('cycle detection', () => {
    it('should detect no cycles in a DAG', () => {
      edge('a', 'b');
      edge('b', 'c');
      const result = traversal.detectCycles();
      expect(result.hasCycles).toBe(false);
    });

    it('should detect a cycle', () => {
      edge('a', 'b');
      edge('b', 'c');
      edge('c', 'a');
      const result = traversal.detectCycles();
      expect(result.hasCycles).toBe(true);
      expect(result.cycles).toBeDefined();
      expect(result.cycles!.length).toBeGreaterThan(0);
    });

    it('should detect a self-loop cycle', () => {
      edge('a', 'a');
      const result = traversal.detectCycles();
      expect(result.hasCycles).toBe(true);
    });
  });

  describe('complex graph traversal', () => {
    beforeEach(() => {
      edge('alice', 'bob', 'knows');
      edge('alice', 'charlie', 'knows');
      edge('bob', 'dave', 'knows');
      edge('charlie', 'eve', 'knows');
      edge('dave', 'frank', 'knows');
    });

    it('should find path through multiple hops', () => {
      const result = traversal.path(id('alice'), id('frank'));
      expect(result).toBeDefined();
      expect(result!.edges.length).toBe(3);
    });

    it('reachableNodes from alice', () => {
      const reachable = traversal.reachableNodes(id('alice'), 10);
      expect(reachable.length).toBe(5);
    });
  });
});
