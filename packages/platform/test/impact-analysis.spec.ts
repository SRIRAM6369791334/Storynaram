import { describe, it, expect } from 'vitest';
import { ReferenceGraph } from '../src/graph/reference-graph';
import { DependencyGraph } from '../src/graph/dependency-graph';
import { ImpactAnalysis } from '../src/graph/impact-analysis';

describe('ImpactAnalysis', () => {
  it('analyzes change with no impacts', () => {
    const refGraph = new ReferenceGraph();
    const depGraph = new DependencyGraph();
    const analysis = new ImpactAnalysis(refGraph, depGraph);
    const result = analysis.analyzeChange('nonexistent');
    expect(result.affectedNodeIds).toHaveLength(0);
    expect(result.severity).toBe('none');
  });

  it('analyzes change with references', () => {
    const refGraph = new ReferenceGraph();
    refGraph.addEntry({
      sourceId: 'a', sourceDomain: 'character', sourceType: 'hero',
      targetId: 'b', targetDomain: 'world', targetType: 'location',
      referenceType: 'lives-in',
    });
    refGraph.addEntry({
      sourceId: 'b', sourceDomain: 'world', sourceType: 'location',
      targetId: 'c', targetDomain: 'canon', targetType: 'event',
      referenceType: 'occurs-in',
    });
    const depGraph = new DependencyGraph();
    const analysis = new ImpactAnalysis(refGraph, depGraph);
    const result = analysis.analyzeChange('a');
    expect(result.affectedNodeIds.length).toBeGreaterThan(0);
    expect(result.severity).toBe('medium');
  });

  it('analyzes domain change with dependencies', () => {
    const refGraph = new ReferenceGraph();
    const depGraph = new DependencyGraph();
    depGraph.addDependency('narrative', 'character');
    depGraph.addDependency('composition', 'narrative');
    const analysis = new ImpactAnalysis(refGraph, depGraph);
    const result = analysis.analyzeDomainChange('character');
    expect(result.affectedDomains).toContain('narrative');
    expect(result.affectedDomains).toContain('composition');
    expect(result.severity).toBe('medium');
  });

  it('returns critical severity for 4+ domains', () => {
    const refGraph = new ReferenceGraph();
    const depGraph = new DependencyGraph();
    depGraph.addDependency('a', 'x');
    depGraph.addDependency('b', 'x');
    depGraph.addDependency('c', 'x');
    depGraph.addDependency('d', 'x');
    depGraph.addDependency('e', 'x');
    const analysis = new ImpactAnalysis(refGraph, depGraph);
    const result = analysis.analyzeDomainChange('x');
    expect(result.severity).toBe('critical');
  });

  it('returns traversal', () => {
    const refGraph = new ReferenceGraph();
    const depGraph = new DependencyGraph();
    const analysis = new ImpactAnalysis(refGraph, depGraph);
    expect(analysis.getTraversal()).toBeDefined();
  });
});
