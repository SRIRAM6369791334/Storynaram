import { describe, it, expect } from 'vitest';
import { Theme, ThemeCollection, ThemeProgress, ThemeEvidence, ThemeResolution } from '../src/theme';

describe('ThemeProgress', () => {
  it('creates with defaults', () => {
    const p = new ThemeProgress();
    expect(p.introduced).toBe(false);
  });

  it('advances through stages', () => {
    const p = new ThemeProgress().advance();
    expect(p.introduced).toBe(true);
    expect(p.developed).toBe(false);
    const p2 = p.advance().advance().advance();
    expect(p2.resolved).toBe(true);
  });
});

describe('ThemeEvidence', () => {
  it('creates with text', () => {
    const e = new ThemeEvidence('quote', 'src-1', 'ch-1', 'sc-1', 5);
    expect(e.text).toBe('quote');
  });

  it('throws on invalid strength', () => {
    expect(() => new ThemeEvidence('q', 's', 'c', 's', 0)).toThrow();
    expect(() => new ThemeEvidence('q', 's', 'c', 's', 11)).toThrow();
  });
});

describe('Theme', () => {
  it('creates with required props', () => {
    const t = new Theme('th-1', 'love', 'Love conquers all');
    expect(t.themeId).toBe('th-1');
    expect(t.statement).toBe('Love conquers all');
  });

  it('throws on empty ID', () => {
    expect(() => new Theme('', 'love', 'statement')).toThrow();
  });

  it('throws on empty statement', () => {
    expect(() => new Theme('th-1', 'love', '')).toThrow();
  });
});

describe('ThemeCollection', () => {
  it('adds and retrieves', () => {
    const c = new ThemeCollection([new Theme('t1', 'love', 'Love wins')]);
    expect(c.count).toBe(1);
    expect(c.get('t1')).toBeDefined();
  });

  it('filters by category', () => {
    const c = new ThemeCollection([
      new Theme('t1', 'love', 'Love wins'),
      new Theme('t2', 'death', 'Death is inevitable'),
    ]);
    expect(c.ofCategory('love')).toHaveLength(1);
  });
});
