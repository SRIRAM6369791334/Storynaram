import { describe, it, expect } from 'vitest';
import { DependencyGraph } from '../src/graph/dependency-graph';

describe('DependencyGraph', () => {
  it('adds a single dependency', () => {
    const graph = new DependencyGraph();
    graph.addDependency('narrative', 'character');
    expect(graph.getDependencies('narrative')).toEqual(['character']);
  });

  it('ignores self-dependency', () => {
    const graph = new DependencyGraph();
    graph.addDependency('character', 'character');
    expect(graph.getDependencies('character')).toHaveLength(0);
  });

  it('adds multiple dependencies', () => {
    const graph = new DependencyGraph();
    graph.addDependencies('composition', ['narrative', 'canon', 'timeline']);
    const deps = graph.getDependencies('composition');
    expect(deps).toContain('narrative');
    expect(deps).toContain('canon');
    expect(deps).toContain('timeline');
  });

  it('gets dependents', () => {
    const graph = new DependencyGraph();
    graph.addDependency('narrative', 'character');
    graph.addDependency('composition', 'character');
    const dependents = graph.getDependents('character');
    expect(dependents).toContain('narrative');
    expect(dependents).toContain('composition');
  });

  it('returns entry for a domain', () => {
    const graph = new DependencyGraph();
    graph.addDependency('narrative', 'character');
    const entry = graph.getEntry('narrative');
    expect(entry.domain).toBe('narrative');
    expect(entry.dependsOn).toEqual(['character']);
    expect(entry.dependedBy).toHaveLength(0);
  });

  it('returns all entries', () => {
    const graph = new DependencyGraph();
    graph.addDependency('a', 'b');
    graph.addDependency('b', 'c');
    const entries = graph.getAllEntries();
    expect(entries.length).toBeGreaterThanOrEqual(3);
  });

  it('computes topological levels', () => {
    const graph = new DependencyGraph();
    graph.addDependency('composition', 'narrative');
    graph.addDependency('narrative', 'character');
    graph.addDependency('character', 'kernel');
    const levels = graph.getTopologicalLevels();
    expect(levels.length).toBeGreaterThan(0);
  });

  it('detects no cycles in a DAG', () => {
    const graph = new DependencyGraph();
    graph.addDependency('a', 'b');
    graph.addDependency('b', 'c');
    const result = graph.detectCycles();
    expect(result.hasCycle).toBe(false);
  });

  it('detects cycles', () => {
    const graph = new DependencyGraph();
    graph.addDependency('a', 'b');
    graph.addDependency('b', 'c');
    graph.addDependency('c', 'a');
    const result = graph.detectCycles();
    expect(result.hasCycle).toBe(true);
  });

  it('converts to graph edges', () => {
    const graph = new DependencyGraph();
    graph.addDependency('a', 'b');
    const edges = graph.toGraphEdges();
    expect(edges).toHaveLength(1);
    expect(edges[0]!.source).toBe('a');
    expect(edges[0]!.target).toBe('b');
  });

  it('converts to graph nodes', () => {
    const graph = new DependencyGraph();
    graph.addDependency('character', 'kernel');
    const nodes = graph.toGraphNodes();
    expect(nodes.length).toBeGreaterThanOrEqual(2);
    expect(nodes.some(n => n.id === 'character')).toBe(true);
  });

  it('returns domain count', () => {
    const graph = new DependencyGraph();
    graph.addDependency('a', 'b');
    graph.addDependency('c', 'd');
    expect(graph.getDomainCount()).toBe(4);
  });
});
