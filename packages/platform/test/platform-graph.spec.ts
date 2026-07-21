import { describe, it, expect } from 'vitest';
import { ReferenceGraph } from '../src/graph/reference-graph';
import { DependencyGraph } from '../src/graph/dependency-graph';
import { ImpactAnalysis } from '../src/graph/impact-analysis';
import { PlatformGraph } from '../src/graph/platform-graph';

describe('PlatformGraph', () => {
  it('creates with empty graphs', () => {
    const refGraph = new ReferenceGraph();
    const depGraph = new DependencyGraph();
    const impact = new ImpactAnalysis(refGraph, depGraph);
    const pg = new PlatformGraph(refGraph, depGraph, impact);
    expect(pg.getAllNodes()).toHaveLength(0);
    expect(pg.getAllEdges()).toHaveLength(0);
  });

  it('returns summary with no data', () => {
    const refGraph = new ReferenceGraph();
    const depGraph = new DependencyGraph();
    const impact = new ImpactAnalysis(refGraph, depGraph);
    const pg = new PlatformGraph(refGraph, depGraph, impact);
    const summary = pg.getSummary();
    expect(summary.totalNodes).toBe(0);
    expect(summary.totalEdges).toBe(0);
    expect(summary.hasCycles).toBe(false);
  });

  it('returns summary with data', () => {
    const refGraph = new ReferenceGraph();
    refGraph.addEntry({
      sourceId: 'a', sourceDomain: 'character', sourceType: 'h',
      targetId: 'b', targetDomain: 'world', targetType: 'w',
      referenceType: 'lives-in',
    });
    const depGraph = new DependencyGraph();
    depGraph.addDependency('narrative', 'character');
    const impact = new ImpactAnalysis(refGraph, depGraph);
    const pg = new PlatformGraph(refGraph, depGraph, impact);
    const summary = pg.getSummary();
    expect(summary.totalNodes).toBeGreaterThan(0);
    expect(summary.totalEdges).toBeGreaterThan(0);
    expect(summary.referenceCount).toBe(1);
    expect(summary.dependencyCount).toBeGreaterThan(0);
    expect(summary.domains.length).toBeGreaterThan(0);
  });

  it('detects cycles across reference and dependency graphs', () => {
    const refGraph = new ReferenceGraph();
    refGraph.addEntry({
      sourceId: 'x', sourceDomain: 'd1', sourceType: 't',
      targetId: 'y', targetDomain: 'd2', targetType: 't',
      referenceType: 'r',
    });
    refGraph.addEntry({
      sourceId: 'y', sourceDomain: 'd2', sourceType: 't',
      targetId: 'x', targetDomain: 'd1', targetType: 't',
      referenceType: 'r',
    });
    const depGraph = new DependencyGraph();
    const impact = new ImpactAnalysis(refGraph, depGraph);
    const pg = new PlatformGraph(refGraph, depGraph, impact);
    const cycles = pg.detectCycles();
    expect(cycles.hasCycle).toBe(true);
  });

  it('returns sub-graph components', () => {
    const refGraph = new ReferenceGraph();
    const depGraph = new DependencyGraph();
    const impact = new ImpactAnalysis(refGraph, depGraph);
    const pg = new PlatformGraph(refGraph, depGraph, impact);
    expect(pg.getReferenceGraph()).toBe(refGraph);
    expect(pg.getDependencyGraph()).toBe(depGraph);
    expect(pg.getImpactAnalysis()).toBe(impact);
    expect(pg.getTraversal()).toBeDefined();
    expect(pg.getCycleDetector()).toBeDefined();
  });
});
