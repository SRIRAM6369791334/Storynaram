import { describe, it, expect, beforeEach } from 'vitest';
import type { EntityId } from '@storynaram/core';
import { RelationshipGraph } from '../src/relationship/relationship-graph';
import { RelationshipConflictError } from '../src/relationship/errors';

function id(value: string): EntityId {
  return value as EntityId;
}

describe('RelationshipGraph', () => {
  let graph: RelationshipGraph;

  beforeEach(() => {
    graph = new RelationshipGraph();
  });

  describe('node operations', () => {
    it('should add a node', () => {
      graph.addNode({ entityId: id('a'), entityType: 'character' });
      const node = graph.getNode(id('a'));
      expect(node).toBeDefined();
      expect(node!.entityType).toBe('character');
    });

    it('should remove a node', () => {
      graph.addNode({ entityId: id('a'), entityType: 'character' });
      expect(graph.removeNode(id('a'))).toBe(true);
      expect(graph.getNode(id('a'))).toBeUndefined();
    });

    it('should return false when removing non-existent node', () => {
      expect(graph.removeNode(id('nonexistent'))).toBe(false);
    });

    it('should check node existence', () => {
      graph.addNode({ entityId: id('a'), entityType: 'character' });
      expect(graph.hasNode(id('a'))).toBe(true);
      expect(graph.hasNode(id('b'))).toBe(false);
    });
  });

  describe('edge operations', () => {
    it('should add an edge', () => {
      const edge = graph.addEdge(id('a'), id('b'), 'directed', 'knows');
      expect(edge.sourceId).toBe(id('a'));
      expect(edge.targetId).toBe(id('b'));
      expect(edge.type).toBe('directed');
      expect(edge.label).toBe('knows');
      expect(edge.weight).toBe(1);
    });

    it('should auto-create nodes when adding edge', () => {
      graph.addEdge(id('a'), id('b'), 'reference');
      expect(graph.hasNode(id('a'))).toBe(true);
      expect(graph.hasNode(id('b'))).toBe(true);
    });

    it('should get edge by endpoints', () => {
      graph.addEdge(id('a'), id('b'), 'directed', 'knows');
      const edge = graph.getEdgeByEndpoints(id('a'), id('b'));
      expect(edge).toBeDefined();
      expect(edge!.type).toBe('directed');
    });

    it('should throw on duplicate edge', () => {
      graph.addEdge(id('a'), id('b'), 'directed');
      expect(() => graph.addEdge(id('a'), id('b'), 'directed')).toThrow(RelationshipConflictError);
    });

    it('should allow different type between same endpoints', () => {
      graph.addEdge(id('a'), id('b'), 'directed');
      const edge = graph.addEdge(id('a'), id('b'), 'ownership');
      expect(edge.type).toBe('ownership');
    });

    it('should remove edge by id', () => {
      const edge = graph.addEdge(id('a'), id('b'), 'directed');
      expect(graph.removeEdge(edge.id)).toBe(true);
      expect(graph.hasEdge(id('a'), id('b'))).toBe(false);
    });

    it('should remove edge by endpoints', () => {
      graph.addEdge(id('a'), id('b'), 'directed');
      expect(graph.removeEdgeByEndpoints(id('a'), id('b'))).toBe(true);
      expect(graph.hasEdge(id('a'), id('b'))).toBe(false);
    });

    it('should remove edge by endpoints with type', () => {
      graph.addEdge(id('a'), id('b'), 'directed', 'knows');
      expect(graph.removeEdgeByEndpoints(id('a'), id('b'), 'directed')).toBe(true);
      expect(graph.hasEdge(id('a'), id('b'))).toBe(false);
    });

    it('should not remove edge when type does not match', () => {
      graph.addEdge(id('a'), id('b'), 'directed');
      expect(graph.removeEdgeByEndpoints(id('a'), id('b'), 'ownership')).toBe(false);
      expect(graph.hasEdge(id('a'), id('b'))).toBe(true);
    });

    it('should filter by type when checking edge existence', () => {
      graph.addEdge(id('a'), id('b'), 'directed');
      expect(graph.hasEdge(id('a'), id('b'), 'directed')).toBe(true);
      expect(graph.hasEdge(id('a'), id('b'), 'ownership')).toBe(false);
    });
  });

  describe('outgoing and incoming edges', () => {
    beforeEach(() => {
      graph.addEdge(id('a'), id('b'), 'directed', 'knows');
      graph.addEdge(id('a'), id('c'), 'directed', 'likes');
      graph.addEdge(id('b'), id('c'), 'ownership', 'owns');
    });

    it('should get outgoing edges', () => {
      const out = graph.getOutgoingEdges(id('a'));
      expect(out.length).toBe(2);
    });

    it('should get incoming edges', () => {
      const inEdges = graph.getIncomingEdges(id('c'));
      expect(inEdges.length).toBe(2);
    });

    it('should get outgoing neighbors', () => {
      const neighbors = graph.getOutgoingNeighbors(id('a'));
      expect(neighbors).toContain(id('b'));
      expect(neighbors).toContain(id('c'));
    });

    it('should get incoming neighbors', () => {
      const neighbors = graph.getIncomingNeighbors(id('c'));
      expect(neighbors).toContain(id('a'));
      expect(neighbors).toContain(id('b'));
    });

    it('should get all neighbors', () => {
      const neighbors = graph.getNeighbors(id('a'));
      expect(neighbors).toContain(id('b'));
      expect(neighbors).toContain(id('c'));
    });

    it('should get only outgoing neighbors', () => {
      const neighbors = graph.getNeighbors(id('b'), 'outgoing');
      expect(neighbors).toEqual([id('c')]);
    });

    it('should get only incoming neighbors', () => {
      const neighbors = graph.getNeighbors(id('b'), 'incoming');
      expect(neighbors).toEqual([id('a')]);
    });
  });

  describe('all edges and nodes', () => {
    it('should return all edges', () => {
      graph.addEdge(id('a'), id('b'), 'directed');
      graph.addEdge(id('b'), id('c'), 'ownership');
      expect(graph.getAllEdges().length).toBe(2);
    });

    it('should return all nodes', () => {
      graph.addNode({ entityId: id('a'), entityType: 'character' });
      graph.addNode({ entityId: id('b'), entityType: 'world' });
      expect(graph.getAllNodes().length).toBe(2);
    });

    it('should track size', () => {
      expect(graph.nodesSize).toBe(0);
      expect(graph.edgesSize).toBe(0);
      graph.addEdge(id('a'), id('b'), 'directed');
      expect(graph.nodesSize).toBe(2);
      expect(graph.edgesSize).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear all nodes and edges', () => {
      graph.addEdge(id('a'), id('b'), 'directed');
      graph.clear();
      expect(graph.nodesSize).toBe(0);
      expect(graph.edgesSize).toBe(0);
    });
  });

  describe('statistics', () => {
    it('should return graph statistics', () => {
      graph.addEdge(id('a'), id('b'), 'directed');
      graph.addEdge(id('a'), id('c'), 'ownership');
      const stats = graph.statistics();
      expect(stats.totalNodes).toBe(3);
      expect(stats.totalEdges).toBe(2);
      expect(stats.totalRelationshipsByType.directed).toBe(1);
      expect(stats.totalRelationshipsByType.ownership).toBe(1);
      expect(stats.componentCount).toBe(1);
    });

    it('should compute density', () => {
      graph.addEdge(id('a'), id('b'), 'directed');
      const stats = graph.statistics();
      expect(stats.density).toBeGreaterThan(0);
    });
  });
});
