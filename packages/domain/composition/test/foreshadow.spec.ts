import { describe, it, expect } from 'vitest';
import { Foreshadow, ForeshadowCollection, ForeshadowReference, ForeshadowPayoff } from '../src/foreshadow';
import { Payoff, PayoffCollection, Resolution, Reward, Consequence } from '../src/payoff';

describe('ForeshadowReference', () => {
  it('creates with source ID', () => {
    const r = new ForeshadowReference('src-1', 'character', 'refers to hero');
    expect(r.sourceId).toBe('src-1');
  });

  it('throws on empty source ID', () => {
    expect(() => new ForeshadowReference('', 'type')).toThrow();
  });
});

describe('ForeshadowPayoff', () => {
  it('creates with defaults', () => {
    const p = new ForeshadowPayoff();
    expect(p.isPaidOff).toBe(false);
  });

  it('paidOff returns new state', () => {
    const p = new ForeshadowPayoff().paidOff('po-1', 'ch-1', 'sc-1', 8);
    expect(p.isPaidOff).toBe(true);
    expect(p.satisfaction).toBe(8);
  });

  it('throws on invalid satisfaction', () => {
    expect(() => new ForeshadowPayoff(false, '', '', '', -1)).toThrow();
    expect(() => new ForeshadowPayoff(false, '', '', '', 11)).toThrow();
  });
});

describe('Foreshadow', () => {
  it('creates with required props', () => {
    const f = new Foreshadow('fs-1', 'Storm coming', 'obvious');
    expect(f.foreshadowId).toBe('fs-1');
    expect(f.clue).toBe('Storm coming');
  });

  it('throws on empty ID', () => {
    expect(() => new Foreshadow('', 'clue')).toThrow();
  });

  it('throws on empty clue', () => {
    expect(() => new Foreshadow('fs-1', '')).toThrow();
  });
});

describe('ForeshadowCollection', () => {
  it('filters unpaid', () => {
    const c = new ForeshadowCollection([
      new Foreshadow('f1', 'Clue 1', 'subtle'),
      new Foreshadow('f2', 'Clue 2', 'direct', '', '', '', [], [],
        new ForeshadowPayoff(true, 'po-1', 'ch-1', 'sc-1', 5)),
    ]);
    expect(c.unpaid()).toHaveLength(1);
    expect(c.paid()).toHaveLength(1);
  });
});

describe('Reward', () => {
  it('creates with defaults', () => {
    const r = new Reward();
    expect(r.type).toBe('emotional');
  });

  it('throws on negative value', () => {
    expect(() => new Reward('gold', 'treasure', -1)).toThrow();
  });
});

describe('Consequence', () => {
  it('creates with defaults', () => {
    const c = new Consequence();
    expect(c.severity).toBe(1);
  });

  it('throws on invalid severity', () => {
    expect(() => new Consequence('death', 'character dies', 11)).toThrow();
    expect(() => new Consequence('death', 'character dies', -1)).toThrow();
  });
});

describe('Payoff', () => {
  it('creates with required props', () => {
    const p = new Payoff('po-1', 'fs-1', 'The storm arrives');
    expect(p.payoffId).toBe('po-1');
    expect(p.foreshadowId).toBe('fs-1');
  });

  it('throws on empty ID', () => {
    expect(() => new Payoff('', 'fs-1', 'desc')).toThrow();
  });

  it('throws on empty foreshadow ID', () => {
    expect(() => new Payoff('po-1', '', 'desc')).toThrow();
  });

  it('throws on empty description', () => {
    expect(() => new Payoff('po-1', 'fs-1', '')).toThrow();
  });
});

describe('PayoffCollection', () => {
  it('filters by foreshadow', () => {
    const c = new PayoffCollection([
      new Payoff('p1', 'fs-1', 'Payoff 1'),
      new Payoff('p2', 'fs-2', 'Payoff 2'),
    ]);
    expect(c.ofForeshadow('fs-1')).toHaveLength(1);
  });
});
