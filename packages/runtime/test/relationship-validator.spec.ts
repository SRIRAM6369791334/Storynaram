import { describe, it, expect, beforeEach } from 'vitest';
import type { EntityId } from '@storynaram/core';
import { RelationshipGraph } from '../src/relationship/relationship-graph';
import { RelationshipValidator } from '../src/relationship/relationship-validator';
import type { CreateRelationshipInput } from '../src/relationship/types';

function id(value: string): EntityId {
  return value as EntityId;
}

describe('RelationshipValidator', () => {
  let graph: RelationshipGraph;
  let validator: RelationshipValidator;

  beforeEach(() => {
    graph = new RelationshipGraph();
    validator = new RelationshipValidator(graph);
    validator.registerTypeConfig({
      type: 'hierarchical',
      allowCycles: false,
      maxTargets: 2,
      allowedSourceTypes: ['character'],
      allowedTargetTypes: ['character'],
    });
    validator.registerTypeConfig({
      type: 'reference',
      allowCycles: true,
      maxTargets: undefined,
    });
  });

  it('should validate a valid edge', async () => {
    graph.addNode({ entityId: id('alice'), entityType: 'character' });
    graph.addNode({ entityId: id('bob'), entityType: 'character' });
    const input: CreateRelationshipInput = {
      sourceId: id('alice'),
      targetId: id('bob'),
      type: 'hierarchical',
    };
    const result = await validator.validateAddEdge(input);
    expect(result.valid).toBe(true);
  });

  it('should reject edge with non-existent source', async () => {
    const input: CreateRelationshipInput = {
      sourceId: id('ghost'),
      targetId: id('bob'),
      type: 'reference',
    };
    const result = await validator.validateAddEdge(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('not found'))).toBe(true);
  });

  it('should reject self-referencing edge', async () => {
    graph.addNode({ entityId: id('alice'), entityType: 'character' });
    const input: CreateRelationshipInput = {
      sourceId: id('alice'),
      targetId: id('alice'),
      type: 'reference',
    };
    const result = await validator.validateAddEdge(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Self-referencing'))).toBe(true);
  });

  it('should reject duplicate edge', async () => {
    graph.addNode({ entityId: id('alice'), entityType: 'character' });
    graph.addNode({ entityId: id('bob'), entityType: 'character' });
    graph.addEdge(id('alice'), id('bob'), 'hierarchical');
    const input: CreateRelationshipInput = {
      sourceId: id('alice'),
      targetId: id('bob'),
      type: 'hierarchical',
    };
    const result = await validator.validateAddEdge(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Duplicate'))).toBe(true);
  });

  it('should enforce maxTargets', async () => {
    graph.addNode({ entityId: id('alice'), entityType: 'character' });
    graph.addNode({ entityId: id('bob'), entityType: 'character' });
    graph.addNode({ entityId: id('charlie'), entityType: 'character' });
    graph.addNode({ entityId: id('dave'), entityType: 'character' });
    graph.addEdge(id('alice'), id('bob'), 'hierarchical');
    graph.addEdge(id('alice'), id('charlie'), 'hierarchical');
    const input: CreateRelationshipInput = {
      sourceId: id('alice'),
      targetId: id('dave'),
      type: 'hierarchical',
    };
    const result = await validator.validateAddEdge(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Maximum'))).toBe(true);
  });

  it('should enforce allowed source types', async () => {
    graph.addNode({ entityId: id('world1'), entityType: 'world' });
    graph.addNode({ entityId: id('alice'), entityType: 'character' });
    const input: CreateRelationshipInput = {
      sourceId: id('world1'),
      targetId: id('alice'),
      type: 'hierarchical',
    };
    const result = await validator.validateAddEdge(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('not allowed'))).toBe(true);
  });

  it('should reject cycle-creating edge when configured', async () => {
    graph.addNode({ entityId: id('alice'), entityType: 'character' });
    graph.addNode({ entityId: id('bob'), entityType: 'character' });
    graph.addNode({ entityId: id('charlie'), entityType: 'character' });
    graph.addEdge(id('alice'), id('bob'), 'hierarchical');
    graph.addEdge(id('bob'), id('charlie'), 'hierarchical');
    const input: CreateRelationshipInput = {
      sourceId: id('charlie'),
      targetId: id('alice'),
      type: 'hierarchical',
    };
    const result = await validator.validateAddEdge(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('cycle'))).toBe(true);
  });

  it('validateEdge should check basic edge fields', () => {
    const result = validator.validateEdge({
      id: 'test', sourceId: '' as EntityId, targetId: '' as EntityId,
      type: 'directed', createdAt: new Date(), updatedAt: new Date(),
    });
    expect(result.valid).toBe(false);
  });
});
