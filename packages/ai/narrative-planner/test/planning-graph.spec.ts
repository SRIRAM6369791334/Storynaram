import { describe, it, expect } from 'vitest';
import { PlanningGraph } from '../src/planning-graph';
import type { PlanningStage } from '../src/planning-graph';

describe('PlanningGraph', () => {
  it('returns all stages', () => {
    const graph = new PlanningGraph();
    const stages = graph.getAllStages();
    expect(stages.length).toBeGreaterThan(0);
    expect(stages).toContain('idea-analysis');
    expect(stages).toContain('character-planning');
  });

  it('returns root stages (no dependencies)', () => {
    const graph = new PlanningGraph();
    const roots = graph.getRootStages();
    expect(roots).toEqual(['idea-analysis']);
  });

  it('returns dependencies for a stage', () => {
    const graph = new PlanningGraph();
    const deps = graph.getDependencies('character-planning');
    expect(deps).toContain('idea-analysis');
  });

  it('returns dependents for a stage', () => {
    const graph = new PlanningGraph();
    const dependents = graph.getDependents('idea-analysis');
    expect(dependents).toContain('character-planning');
    expect(dependents).toContain('world-planning');
  });

  it('returns topological order', () => {
    const graph = new PlanningGraph();
    const order = graph.getTopologicalOrder();
    expect(order.indexOf('idea-analysis')).toBeLessThan(order.indexOf('character-planning'));
    expect(order.indexOf('idea-analysis')).toBeLessThan(order.indexOf('world-planning'));
  });

  it('detects no cycles in default graph', () => {
    const graph = new PlanningGraph();
    const result = graph.detectCycles();
    expect(result.hasCycle).toBe(false);
  });

  it('detects cycles in custom graph with cycles', () => {
    const graph = new PlanningGraph([
      { stage: 'a' as PlanningStage, dependsOn: ['b' as PlanningStage] },
      { stage: 'b' as PlanningStage, dependsOn: ['c' as PlanningStage] },
      { stage: 'c' as PlanningStage, dependsOn: ['a' as PlanningStage] },
    ]);
    const result = graph.detectCycles();
    expect(result.hasCycle).toBe(true);
  });

  it('determines parallel execution capability', () => {
    const graph = new PlanningGraph();
    expect(graph.canRunInParallel('character-planning', 'world-planning')).toBe(true);
    expect(graph.canRunInParallel('composition-planning', 'prompt-assembly')).toBe(false);
  });

  it('returns parallel groups', () => {
    const graph = new PlanningGraph();
    const groups = graph.getParallelGroups();
    expect(groups.length).toBeGreaterThan(0);
  });

  it('converts to graph nodes', () => {
    const graph = new PlanningGraph();
    const nodes = graph.toGraphNodes();
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes[0]!.type).toBe('planning-stage');
  });

  it('converts to graph edges', () => {
    const graph = new PlanningGraph();
    const edges = graph.toGraphEdges();
    expect(edges.length).toBeGreaterThan(0);
  });
});
