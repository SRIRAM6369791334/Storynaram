import { describe, it, expect, beforeEach } from 'vitest';
import type { EntityId } from '@storynaram/core';
import { RelationshipGraph } from '../src/relationship/relationship-graph';
import { RelationshipService } from '../src/relationship/relationship-service';
import { RelationshipTraversalService } from '../src/relationship/relationship-traversal.service';
import { RelationshipQueryService } from '../src/relationship/relationship-query.service';
import { RelationshipValidator } from '../src/relationship/relationship-validator';
import { RelationshipValidationError } from '../src/relationship/errors';

function id(value: string): EntityId {
  return value as EntityId;
}

describe('RelationshipService', () => {
  let service: RelationshipService;
  let graph: RelationshipGraph;
  let validator: RelationshipValidator;

  beforeEach(() => {
    graph = new RelationshipGraph();
    const traversal = new RelationshipTraversalService(graph);
    const queryService = new RelationshipQueryService(graph);
    validator = new RelationshipValidator(graph);
    service = new RelationshipService(traversal, queryService, validator);
    graph.addNode({ entityId: id('alice'), entityType: 'character' });
    graph.addNode({ entityId: id('bob'), entityType: 'character' });
    graph.addNode({ entityId: id('charlie'), entityType: 'character' });
  });

  it('should connect two nodes', async () => {
    const edge = await service.connect({
      sourceId: id('alice'),
      targetId: id('bob'),
      type: 'knows',
    });
    expect(edge.sourceId).toBe(id('alice'));
    expect(edge.targetId).toBe(id('bob'));
  });

  it('should disconnect nodes', async () => {
    await service.connect({ sourceId: id('alice'), targetId: id('bob'), type: 'knows' });
    const removed = await service.disconnect(id('alice'), id('bob'));
    expect(removed).toBe(true);
    expect(service.hasEdge(id('alice'), id('bob'))).toBe(false);
  });

  it('should remove edge by id', async () => {
    const edge = await service.connect({ sourceId: id('alice'), targetId: id('bob'), type: 'knows' });
    const removed = await service.removeEdge(edge.id);
    expect(removed).toBe(true);
  });

  it('should check node existence', () => {
    expect(service.hasNode(id('alice'))).toBe(true);
    expect(service.hasNode(id('nonexistent'))).toBe(false);
  });

  it('should get edge between nodes', async () => {
    await service.connect({ sourceId: id('alice'), targetId: id('bob'), type: 'knows' });
    const edge = service.getEdgeBetween(id('alice'), id('bob'));
    expect(edge).toBeDefined();
  });

  it('should throw on self-connecting', async () => {
    await expect(service.connect({
      sourceId: id('alice'),
      targetId: id('alice'),
      type: 'knows',
    })).rejects.toThrow(RelationshipValidationError);
  });

  it('should throw on duplicate connection', async () => {
    await service.connect({ sourceId: id('alice'), targetId: id('bob'), type: 'knows' });
    await expect(service.connect({
      sourceId: id('alice'),
      targetId: id('bob'),
      type: 'knows',
    })).rejects.toThrow(RelationshipValidationError);
  });

  it('should get outgoing edges', async () => {
    await service.connect({ sourceId: id('alice'), targetId: id('bob'), type: 'knows' });
    const out = service.getOutgoing(id('alice'));
    expect(out.length).toBe(1);
  });

  it('should get incoming edges', async () => {
    await service.connect({ sourceId: id('alice'), targetId: id('bob'), type: 'knows' });
    const inEdges = service.getIncoming(id('bob'));
    expect(inEdges.length).toBe(1);
  });

  it('should get neighbors', async () => {
    await service.connect({ sourceId: id('alice'), targetId: id('bob'), type: 'knows' });
    const neighbors = service.getNeighbors(id('alice'));
    expect(neighbors).toContain(id('bob'));
  });

  it('should remove node and its edges', async () => {
    await service.connect({ sourceId: id('alice'), targetId: id('bob'), type: 'knows' });
    const removed = await service.removeNode(id('alice'));
    expect(removed).toBe(true);
    expect(service.hasNode(id('alice'))).toBe(false);
    expect(service.hasEdge(id('alice'), id('bob'))).toBe(false);
  });

  it('should find path', async () => {
    await service.connect({ sourceId: id('alice'), targetId: id('bob'), type: 'knows' });
    await service.connect({ sourceId: id('bob'), targetId: id('charlie'), type: 'knows' });
    const result = service.path(id('alice'), id('charlie'));
    expect(result).toBeDefined();
    expect(result!.edges.length).toBe(2);
  });

  it('should detect cycles', async () => {
    await service.connect({ sourceId: id('alice'), targetId: id('bob'), type: 'knows' });
    await service.connect({ sourceId: id('bob'), targetId: id('charlie'), type: 'knows' });
    await service.connect({ sourceId: id('charlie'), targetId: id('alice'), type: 'knows' });
    const cycles = service.detectCycles();
    expect(cycles.hasCycles).toBe(true);
  });

  it('should compute statistics', async () => {
    await service.connect({ sourceId: id('alice'), targetId: id('bob'), type: 'knows' });
    await service.connect({ sourceId: id('alice'), targetId: id('charlie'), type: 'knows' });
    const stats = service.statistics();
    expect(stats.totalNodes).toBe(3);
    expect(stats.totalEdges).toBe(2);
  });
});
