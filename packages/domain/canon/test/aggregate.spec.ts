import { describe, it, expect } from 'vitest';
import { CanonAggregate } from '../src/canon-aggregate';
import { CanonIdentity } from '../src/canon-identity';
import { CanonConflict } from '../src/canon-conflict';
import { CanonFact } from '../src/canon-fact';
import { CanonReference } from '../src/canon-reference';
import { CanonRule } from '../src/canon-rule';

describe('CanonAggregate', () => {
  it('creates with identity', () => {
    const canon = new CanonAggregate(CanonIdentity.create());
    expect(canon.identity).toBeDefined();
  });

  it('initializes with name', () => {
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Story Canon', 'Canonical truth for the story');
    expect(canon.name).toBe('Story Canon');
    expect(canon.description).toBe('Canonical truth for the story');
  });

  it('emits created event on initialize', () => {
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test Canon', '');
    expect(canon.domainEvents.some(e => e.eventType === 'canon.created')).toBe(true);
  });

  it('adds entries', () => {
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test Canon', '');
    canon.addEntry('entry-1', 'character', 'name', 'Gandalf');
    expect(canon.entries.count).toBe(1);
    expect(canon.domainEvents.some(e => e.eventType === 'canon.fact.added')).toBe(true);
  });

  it('rejects duplicate key', () => {
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    canon.addEntry('entry-1', 'character', 'name', 'Gandalf');
    expect(() => {
      canon.addEntry('entry-2', 'character', 'name', 'Saruman');
    }).toThrow();
  });

  it('prevents same key with different value', () => {
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    canon.addEntry('entry-1', 'character', 'name', 'Gandalf');
    expect(() => {
      canon.addEntry('entry-2', 'character', 'name', 'Saruman');
    }).toThrow();
  });

  it('updates entries with versioning', () => {
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    canon.addEntry('entry-1', 'character', 'name', 'Gandalf');
    canon.updateEntry('entry-1', 'Gandalf the Grey', 'Updated appearance');
    expect(canon.domainEvents.some(e => e.eventType === 'canon.fact.updated')).toBe(true);
  });

  it('throws on update of non-existent entry', () => {
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    expect(() => canon.updateEntry('ghost', 'x', 'reason')).toThrow();
  });

  it('deprecates entries', () => {
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    canon.addEntry('entry-1', 'character', 'name', 'Gandalf');
    canon.deprecateEntry('entry-1');
    expect(canon.entries.get('entry-1')?.status).toBe('deprecated');
  });

  it('throws on deprecation of non-existent entry', () => {
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    expect(() => canon.deprecateEntry('ghost')).toThrow();
  });

  it('resolves conflicts', () => {
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    canon.addEntry('entry-1', 'character', 'name', 'Gandalf');
    const conflict = new CanonConflict('conflict-1', 'entry-1', 'entry-2', 'name', 'Test conflict');
    canon.entries.get('entry-1')!.addConflict(conflict);
    canon.resolveConflict('conflict-1', 'use_current', 'Gandalf', 'Authoritative', 'admin');
    expect(canon.domainEvents.some(e => e.eventType === 'canon.conflict.resolved')).toBe(true);
  });

  it('throws on unknown conflict resolution', () => {
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    expect(() => canon.resolveConflict('ghost', 'use_current', 'x', 'reason', 'admin')).toThrow();
  });

  it('manages rules', () => {
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    const rule = new CanonRule('r1', 'Single Truth', 'No duplicates', 'consistency');
    canon.addRule(rule);
    expect(canon.rules).toHaveLength(1);
  });

  it('publishes canon', () => {
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test Canon', '');
    canon.addEntry('entry-1', 'character', 'name', 'Gandalf');
    canon.publish();
    expect(canon.isPublished).toBe(true);
    expect(canon.domainEvents.some(e => e.eventType === 'canon.published')).toBe(true);
  });

  it('prevents publish with unresolved conflicts', () => {
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    canon.addEntry('entry-1', 'character', 'name', 'Gandalf');
    const conflict = new CanonConflict('conflict-1', 'entry-1', 'entry-2', 'name', 'Test conflict');
    canon.entries.get('entry-1')!.addConflict(conflict);
    expect(() => canon.publish()).toThrow();
  });

  it('filters entries by type', () => {
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    canon.addEntry('e1', 'character', 'charName', 'Gandalf');
    canon.addEntry('e2', 'world', 'worldName', 'Middle-earth');
    const chars = canon.entriesOfType('character');
    expect(chars).toHaveLength(1);
    expect(chars[0]!.entryId).toBe('e1');
  });

  it('filters entries by key', () => {
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    canon.addEntry('e1', 'character', 'age', 'Unknown');
    canon.addEntry('e2', 'character', 'name', 'Gandalf');
    const byKey = canon.entriesByKey('name');
    expect(byKey).toHaveLength(1);
  });

  it('supports snapshots', () => {
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    canon.addEntry('e1', 'character', 'name', 'Gandalf');
    const snapshot = canon.createSnapshot();
    expect(snapshot.aggregateId).toBe('1');
    expect(snapshot.version).toBe(canon.version.value);
  });

  it('version increments on changes', () => {
    const canon = new CanonAggregate(new CanonIdentity('1'));
    canon.initialize('Test', '');
    const v1 = canon.version.value;
    canon.addEntry('e1', 'character', 'name', 'Gandalf');
    expect(canon.version.value).toBe(v1 + 1);
  });
});
