import { describe, it, expect } from 'vitest';
import { CanonIdentity } from '../src/canon-identity';
import { CanonFact } from '../src/canon-fact';
import { CanonReference } from '../src/canon-reference';
import { CanonSource } from '../src/canon-source';
import { CanonVersion } from '../src/canon-version';
import { CanonConflict } from '../src/canon-conflict';
import { CanonResolution } from '../src/canon-resolution';
import { CanonRule } from '../src/canon-rule';

describe('CanonIdentity', () => {
  it('creates with value', () => {
    const id = new CanonIdentity('canon-1');
    expect(id.value).toBe('canon-1');
  });

  it('creates with random UUID', () => {
    const id = CanonIdentity.create();
    expect(id.value).toBeDefined();
  });
});

describe('CanonFact', () => {
  it('creates with required props', () => {
    const fact = new CanonFact('fact-1', 'character', 'name', 'Gandalf');
    expect(fact.factId).toBe('fact-1');
    expect(fact.key).toBe('name');
    expect(fact.value).toBe('Gandalf');
    expect(fact.confidence).toBe(1);
  });

  it('throws on empty fact ID', () => {
    expect(() => new CanonFact('', 'character', 'name', 'x')).toThrow();
  });

  it('throws on empty key', () => {
    expect(() => new CanonFact('f1', 'character', '', 'x')).toThrow();
  });

  it('throws on invalid confidence', () => {
    expect(() => new CanonFact('f1', 'character', 'k', 'v', [], 1.5)).toThrow();
    expect(() => new CanonFact('f1', 'character', 'k', 'v', [], -0.5)).toThrow();
  });

  it('hasTag checks tags', () => {
    const fact = new CanonFact('f1', 'world', 'climate', 'temperate', [], 1, ['geography', 'climate']);
    expect(fact.hasTag('geography')).toBe(true);
    expect(fact.hasTag('magic')).toBe(false);
  });
});

describe('CanonReference', () => {
  it('creates with required props', () => {
    const ref = new CanonReference('character', 'char-1', 'Character');
    expect(ref.domainType).toBe('character');
    expect(ref.entityId).toBe('char-1');
  });

  it('throws on empty domain type', () => {
    expect(() => new CanonReference('' as any, 'id', 'type')).toThrow();
  });

  it('throws on empty entity ID', () => {
    expect(() => new CanonReference('character', '', 'type')).toThrow();
  });
});

describe('CanonSource', () => {
  it('creates with required props', () => {
    const source = new CanonSource('user', 'user-1');
    expect(source.sourceType).toBe('user');
    expect(source.sourceId).toBe('user-1');
  });

  it('throws on empty source type', () => {
    expect(() => new CanonSource('' as any, 'id')).toThrow();
  });
});

describe('CanonVersion', () => {
  it('creates with required props', () => {
    const fact = new CanonFact('f1', 'character', 'name', 'Aragorn');
    const version = new CanonVersion(1, fact, new Date('2024-01-01'), 'Initial creation');
    expect(version.version).toBe(1);
    expect(version.reason).toBe('Initial creation');
  });

  it('throws on version < 1', () => {
    const fact = new CanonFact('f1', 'character', 'name', 'x');
    expect(() => new CanonVersion(0, fact, new Date(), 'reason')).toThrow();
  });

  it('throws on empty reason', () => {
    const fact = new CanonFact('f1', 'character', 'name', 'x');
    expect(() => new CanonVersion(1, fact, new Date(), '')).toThrow();
  });
});

describe('CanonConflict', () => {
  it('creates with required props', () => {
    const conflict = new CanonConflict('c1', 'entry-1', 'entry-2', 'name', 'Values differ');
    expect(conflict.status).toBe('open');
    expect(conflict.resolution).toBeNull();
  });

  it('throws on empty conflict ID', () => {
    expect(() => new CanonConflict('', 'e1', 'e2', 'k', 'desc')).toThrow();
  });

  it('resolve updates status', () => {
    const conflict = new CanonConflict('c1', 'e1', 'e2', 'name', 'Values differ');
    const resolution = new CanonResolution('use_current', 'Gandalf', 'Correct value', 'admin');
    const resolved = conflict.resolve(resolution);
    expect(resolved.status).toBe('resolved');
    expect(resolved.resolution?.resolvedBy).toBe('admin');
  });
});

describe('CanonResolution', () => {
  it('creates with required props', () => {
    const res = new CanonResolution('use_current', 'Gandalf', 'Authoritative source', 'admin');
    expect(res.strategy).toBe('use_current');
    expect(res.reason).toBe('Authoritative source');
  });

  it('throws on empty reason', () => {
    expect(() => new CanonResolution('override', 'x', '', 'admin')).toThrow();
  });

  it('throws on empty resolvedBy', () => {
    expect(() => new CanonResolution('merge', 'x', 'reason', '')).toThrow();
  });
});

describe('CanonRule', () => {
  it('creates with required props', () => {
    const rule = new CanonRule('r1', 'Single Truth', 'No duplicate keys', 'consistency', 'error');
    expect(rule.ruleId).toBe('r1');
    expect(rule.severity).toBe('error');
  });

  it('throws on empty rule ID', () => {
    expect(() => new CanonRule('', 'name', 'desc', 'validation')).toThrow();
  });

  it('throws on empty name', () => {
    expect(() => new CanonRule('r1', '', 'desc', 'governance')).toThrow();
  });
});
