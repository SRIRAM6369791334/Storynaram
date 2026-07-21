import { describe, it, expect } from 'vitest';
import {
  CanonCreatedEvent,
  FactAddedEvent,
  FactUpdatedEvent,
  ConflictDetectedEvent,
  ConflictResolvedEvent,
  CanonPublishedEvent,
} from '../src/canon-events';

describe('CanonCreatedEvent', () => {
  it('creates with payload', () => {
    const event = new CanonCreatedEvent('canon-1', { name: 'Main Canon', description: 'Primary canon' });
    expect(event.eventType).toBe('canon.created');
    expect(event.aggregateId).toBe('canon-1');
    expect(event.payload.name).toBe('Main Canon');
  });
});

describe('FactAddedEvent', () => {
  it('creates with event info', () => {
    const event = new FactAddedEvent('canon-1', { entryId: 'entry-1', factType: 'character', key: 'name' });
    expect(event.eventType).toBe('canon.fact.added');
    expect(event.payload.entryId).toBe('entry-1');
  });
});

describe('FactUpdatedEvent', () => {
  it('creates with update info', () => {
    const event = new FactUpdatedEvent('canon-1', { entryId: 'entry-1', key: 'name', version: 2 });
    expect(event.eventType).toBe('canon.fact.updated');
    expect(event.payload.version).toBe(2);
  });
});

describe('ConflictDetectedEvent', () => {
  it('creates with conflict info', () => {
    const event = new ConflictDetectedEvent('canon-1', { conflictId: 'c1', entryId: 'entry-1', key: 'name' });
    expect(event.eventType).toBe('canon.conflict.detected');
    expect(event.payload.conflictId).toBe('c1');
  });
});

describe('ConflictResolvedEvent', () => {
  it('creates with resolution info', () => {
    const event = new ConflictResolvedEvent('canon-1', { conflictId: 'c1', entryId: 'entry-1', strategy: 'use_current' });
    expect(event.eventType).toBe('canon.conflict.resolved');
    expect(event.payload.strategy).toBe('use_current');
  });
});

describe('CanonPublishedEvent', () => {
  it('creates with publish info', () => {
    const event = new CanonPublishedEvent('canon-1', { name: 'Story Canon', entryCount: 42 });
    expect(event.eventType).toBe('canon.published');
    expect(event.payload.entryCount).toBe(42);
  });
});
