import { describe, it, expect } from 'vitest';
import { Conflict, ConflictCollection, ConflictResolution } from '../src/conflict';

describe('ConflictResolution', () => {
  it('creates with defaults', () => {
    const r = new ConflictResolution();
    expect(r.resolved).toBe(false);
  });
});

describe('Conflict', () => {
  it('creates with required props', () => {
    const c = new Conflict('c-1', 'characterVsCharacter', 'major', 'active', ['hero', 'villain'], 'Epic battle');
    expect(c.conflictId).toBe('c-1');
    expect(c.category).toBe('characterVsCharacter');
  });

  it('throws on empty conflict ID', () => {
    expect(() => new Conflict('', 'characterVsSelf')).toThrow();
  });
});

describe('ConflictCollection', () => {
  it('adds and retrieves', () => {
    const c = new ConflictCollection([new Conflict('c1', 'characterVsSelf')]);
    expect(c.count).toBe(1);
    expect(c.get('c1')).toBeDefined();
  });

  it('filters by category', () => {
    const c = new ConflictCollection([
      new Conflict('c1', 'characterVsCharacter', 'minor', 'active', ['a', 'b']),
      new Conflict('c2', 'characterVsSelf'),
    ]);
    expect(c.ofCategory('characterVsCharacter')).toHaveLength(1);
  });

  it('filters by state', () => {
    const c = new ConflictCollection([
      new Conflict('c1', 'characterVsCharacter', 'minor', 'active', ['a', 'b']),
      new Conflict('c2', 'characterVsSelf', 'moderate', 'resolved', [], '', '', '',
        new ConflictResolution(true, 'done')),
    ]);
    expect(c.resolved()).toHaveLength(1);
    expect(c.active()).toHaveLength(1);
  });

  it('filters by party', () => {
    const c = new ConflictCollection([
      new Conflict('c1', 'characterVsCharacter', 'minor', 'active', ['hero', 'villain']),
      new Conflict('c2', 'characterVsCharacter', 'minor', 'active', ['hero', 'monster']),
    ]);
    expect(c.involvingParty('villain')).toHaveLength(1);
  });
});
