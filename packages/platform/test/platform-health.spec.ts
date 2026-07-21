import { describe, it, expect } from 'vitest';
import { IntegrationRegistry } from '../src/integration-registry';
import { ReferenceGraph } from '../src/graph/reference-graph';
import { DependencyGraph } from '../src/graph/dependency-graph';
import { ImpactAnalysis } from '../src/graph/impact-analysis';
import { PlatformGraph } from '../src/graph/platform-graph';
import { PlatformHealthService } from '../src/platform-health';

describe('PlatformHealthService', () => {
  it('reports healthy with registered domains and graph data', () => {
    const registry = new IntegrationRegistry();
    registry.register({
      domain: 'character', name: 'C', version: '1', repository: {}, dependencies: [], events: [],
    });
    const refGraph = new ReferenceGraph();
    refGraph.addEntry({
      sourceId: 'a', sourceDomain: 'character', sourceType: 'h',
      targetId: 'b', targetDomain: 'world', targetType: 'w',
      referenceType: 'lives-in',
    });
    const depGraph = new DependencyGraph();
    depGraph.addDependency('narrative', 'character');
    const impact = new ImpactAnalysis(refGraph, depGraph);
    const platformGraph = new PlatformGraph(refGraph, depGraph, impact);
    const health = new PlatformHealthService(registry, platformGraph);
    const result = health.check();
    expect(result.status).toBe('healthy');
    expect(result.domains).toHaveLength(1);
  });

  it('reports degraded when dependency cycles exist', () => {
    const registry = new IntegrationRegistry();
    registry.register({
      domain: 'character', name: '', version: '', repository: {}, dependencies: [], events: [],
    });
    const refGraph = new ReferenceGraph();
    refGraph.addEntry({
      sourceId: 'a', sourceDomain: 'character', sourceType: 't',
      targetId: 'b', targetDomain: 'character', targetType: 't',
      referenceType: 'r',
    });
    const depGraph = new DependencyGraph();
    depGraph.addDependency('character', 'world');
    depGraph.addDependency('world', 'character');
    const impact = new ImpactAnalysis(refGraph, depGraph);
    const platformGraph = new PlatformGraph(refGraph, depGraph, impact);
    const health = new PlatformHealthService(registry, platformGraph);
    const result = health.check();
    expect(result.status).toBe('degraded');
  });

  it('reports unhealthy with empty graph', () => {
    const registry = new IntegrationRegistry();
    const refGraph = new ReferenceGraph();
    const depGraph = new DependencyGraph();
    const impact = new ImpactAnalysis(refGraph, depGraph);
    const platformGraph = new PlatformGraph(refGraph, depGraph, impact);
    const health = new PlatformHealthService(registry, platformGraph);
    const result = health.check();
    expect(result.status).toBe('unhealthy');
    expect(result.graphHealth.nodeHealth).toBe('unhealthy');
  });

  it('reports uptime', () => {
    const registry = new IntegrationRegistry();
    const refGraph = new ReferenceGraph();
    const depGraph = new DependencyGraph();
    const impact = new ImpactAnalysis(refGraph, depGraph);
    const platformGraph = new PlatformGraph(refGraph, depGraph, impact);
    const health = new PlatformHealthService(registry, platformGraph);
    const result = health.check();
    expect(result.uptime).toBeGreaterThanOrEqual(0);
    expect(result.lastCheck).toBeInstanceOf(Date);
  });
});
