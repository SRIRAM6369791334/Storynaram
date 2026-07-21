import { describe, it, expect } from 'vitest';
import { DependencyReportBuilder } from '../src/observability/dependency-report';
import { DependencyGraph } from '../src/graph/dependency-graph';

describe('DependencyReportBuilder', () => {
  it('builds report for empty graph', () => {
    const graph = new DependencyGraph();
    const builder = new DependencyReportBuilder();
    const report = builder.build(graph);
    expect(report.totalDomains).toBe(0);
    expect(report.totalDependencies).toBe(0);
    expect(report.hasCycles).toBe(false);
    expect(report.topologicalLevels).toBe(0);
  });

  it('builds report with dependencies', () => {
    const graph = new DependencyGraph();
    graph.addDependency('composition', 'narrative');
    graph.addDependency('narrative', 'character');
    graph.addDependency('character', 'kernel');
    const builder = new DependencyReportBuilder();
    const report = builder.build(graph);
    expect(report.totalDomains).toBeGreaterThanOrEqual(4);
    expect(report.totalDependencies).toBeGreaterThanOrEqual(3);
    expect(report.hasCycles).toBe(false);
    expect(report.topologicalLevels).toBeGreaterThan(0);
  });

  it('detects cycles in report', () => {
    const graph = new DependencyGraph();
    graph.addDependency('a', 'b');
    graph.addDependency('b', 'c');
    graph.addDependency('c', 'a');
    const builder = new DependencyReportBuilder();
    const report = builder.build(graph);
    expect(report.hasCycles).toBe(true);
    expect(report.entries.some(e => e.hasCycles)).toBe(true);
  });

  it('populates dependsOn and dependedBy for each entry', () => {
    const graph = new DependencyGraph();
    graph.addDependency('narrative', 'character');
    graph.addDependency('composition', 'narrative');
    const builder = new DependencyReportBuilder();
    const report = builder.build(graph);
    const narrativeEntry = report.entries.find(e => e.domain === 'narrative');
    expect(narrativeEntry).toBeDefined();
    expect(narrativeEntry!.dependsOn).toContain('character');
    expect(narrativeEntry!.dependedBy).toContain('composition');
  });
});
