import { describe, it, expect, beforeEach } from 'vitest';
import type { EntityId } from '@storynaram/core';
import { RelationshipGraph } from '../src/relationship/relationship-graph';
import { RelationshipQueryService } from '../src/relationship/relationship-query.service';

function id(value: string): EntityId {
  return value as EntityId;
}

describe('RelationshipQueryService', () => {
  let graph: RelationshipGraph;
  let queryService: RelationshipQueryService;

  beforeEach(() => {
    graph = new RelationshipGraph();
    graph.addNode({ entityId: id('alice'), entityType: 'character' });
    graph.addNode({ entityId: id('bob'), entityType: 'character' });
    graph.addNode({ entityId: id('world1'), entityType: 'world' });
    graph.addNode({ entityId: id('world2'), entityType: 'world' });
    graph.addEdge(id('alice'), id('bob'), 'knows', 'friend');
    graph.addEdge(id('alice'), id('world1'), 'owns', 'home');
    graph.addEdge(id('bob'), id('world2'), 'owns', 'home');
    graph.addEdge(id('world1'), id('world2'), 'borders', 'north');
    queryService = new RelationshipQueryService(graph);
  });

  it('findRelations by source', () => {
    const results = queryService.findRelations({ sourceId: id('alice') });
    expect(results.length).toBe(2);
  });

  it('findRelations by target', () => {
    const results = queryService.findRelations({ targetId: id('world2') });
    expect(results.length).toBe(2);
  });

  it('findRelations by type', () => {
    const results = queryService.findRelations({ type: 'knows' as any });
    expect(results.length).toBe(1);
  });

  it('findRelations by direction incoming', () => {
    const results = queryService.findRelations({ sourceId: id('world2'), direction: 'incoming' });
    expect(results.length).toBe(0);
  });

  it('findRelations by label', () => {
    const results = queryService.findRelations({ label: 'home' });
    expect(results.length).toBe(2);
  });

  it('findIncoming', () => {
    const results = queryService.findIncoming(id('world2'));
    expect(results.length).toBe(2);
  });

  it('findOutgoing', () => {
    const results = queryService.findOutgoing(id('alice'));
    expect(results.length).toBe(2);
  });

  it('findIncoming with type', () => {
    const results = queryService.findIncoming(id('world2'), 'borders');
    expect(results.length).toBe(1);
  });

  it('findByType', () => {
    const results = queryService.findByType('owns');
    expect(results.length).toBe(2);
  });

  it('search by type filter', () => {
    const result = queryService.search({ types: ['knows'] });
    expect(result.total).toBe(1);
  });

  it('search by source type', () => {
    const result = queryService.search({ sourceTypes: ['character'] });
    expect(result.total).toBe(3);
  });

  it('search by target type', () => {
    const result = queryService.search({ targetTypes: ['world'] });
    expect(result.total).toBe(3);
  });

  it('search supports pagination', () => {
    const result = queryService.search({ limit: 1, offset: 0 });
    expect(result.edges.length).toBe(1);
    expect(result.total).toBe(4);
  });
});
