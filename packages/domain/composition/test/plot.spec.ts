import { describe, it, expect } from 'vitest';
import { Plot, PlotPoint, PlotPointCollection, PlotProgress, PlotStatistics } from '../src/plot';

describe('PlotPoint', () => {
  it('creates with required props', () => {
    const p = new PlotPoint('pp-1', 'setup', 'ch-1', 'sc-1', 'The Beginning');
    expect(p.pointId).toBe('pp-1');
    expect(p.stage).toBe('setup');
  });

  it('throws on empty point ID', () => {
    expect(() => new PlotPoint('', 'setup', 'ch-1', 'sc-1')).toThrow();
  });

  it('throws on empty chapter ID', () => {
    expect(() => new PlotPoint('p1', 'setup', '', 'sc-1')).toThrow();
  });
});

describe('PlotPointCollection', () => {
  it('adds and retrieves points', () => {
    const p = new PlotPoint('p1', 'setup', 'ch-1', 'sc-1');
    const c = new PlotPointCollection().add(p);
    expect(c.count).toBe(1);
    expect(c.get('p1')).toBeDefined();
  });

  it('filters by stage', () => {
    const c = new PlotPointCollection([
      new PlotPoint('p1', 'setup', 'ch-1', 'sc-1'),
      new PlotPoint('p2', 'climax', 'ch-1', 'sc-2'),
      new PlotPoint('p3', 'resolution', 'ch-1', 'sc-3'),
    ]);
    expect(c.ofStage('climax')).toHaveLength(1);
  });

  it('sorts by order', () => {
    const c = new PlotPointCollection([
      new PlotPoint('p1', 'setup', 'ch-1', 'sc-1', '', '', [], [], [], 3),
      new PlotPoint('p2', 'climax', 'ch-1', 'sc-2', '', '', [], [], [], 1),
    ]);
    expect(c.sorted()[0]?.pointId).toBe('p2');
  });
});

describe('Plot', () => {
  it('creates with default structure', () => {
    const plot = new Plot();
    expect(plot.structure).toBe('threeAct');
    expect(plot.plotType).toBe('linear');
  });

  it('creates with custom structure', () => {
    const plot = new Plot('heroJourney', 'branching');
    expect(plot.structure).toBe('heroJourney');
    expect(plot.plotType).toBe('branching');
  });
});

describe('PlotProgress', () => {
  it('calculates percentage', () => {
    const p = new PlotProgress(5, 10);
    expect(p.percentage).toBe(50);
  });

  it('returns 0 for empty', () => {
    const p = new PlotProgress(0, 0);
    expect(p.percentage).toBe(0);
  });
});

describe('PlotStatistics', () => {
  it('creates with defaults', () => {
    const s = new PlotStatistics();
    expect(s.totalBranches).toBe(0);
  });
});
