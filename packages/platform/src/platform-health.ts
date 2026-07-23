import { IntegrationRegistry, DomainType } from './integration-registry.js';
import { PlatformGraph } from './graph/platform-graph.js';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  domains: DomainHealth[];
  graphHealth: GraphHealth;
  uptime: number;
  lastCheck: Date;
}

export interface DomainHealth {
  domain: DomainType;
  registered: boolean;
  hasDependencies: boolean;
  dependencyCount: number;
  cycles: boolean;
}

export interface GraphHealth {
  totalNodes: number;
  totalEdges: number;
  hasCycles: boolean;
  nodeHealth: 'healthy' | 'degraded' | 'unhealthy';
  edgeHealth: 'healthy' | 'degraded' | 'unhealthy';
}

export class PlatformHealthService {
  private readonly startTime = Date.now();

  constructor(
    private readonly registry: IntegrationRegistry,
    private readonly platformGraph: PlatformGraph,
  ) {}

  check(): HealthStatus {
    const domains = this.checkDomains();
    const graphHealth = this.checkGraphHealth();
    const degradedDomains = domains.filter(d => !d.registered || d.cycles);
    const unhealthyGraph = graphHealth.nodeHealth === 'unhealthy' || graphHealth.edgeHealth === 'unhealthy';

    let status: HealthStatus['status'] = 'healthy';
    if (unhealthyGraph) status = 'unhealthy';
    else if (degradedDomains.length > 0) status = 'degraded';

    return {
      status,
      domains,
      graphHealth,
      uptime: Date.now() - this.startTime,
      lastCheck: new Date(),
    };
  }

  private checkDomains(): DomainHealth[] {
    return this.registry.getAll().map(r => {
      const deps = this.registry.getDependencies(r.domain);
      const graphEdges = this.platformGraph.getDependencyGraph().toGraphEdges();
      const domainCycles = this.platformGraph.getDependencyGraph().detectCycles();
      const involved = domainCycles.involvedNodes.includes(r.domain);

      return {
        domain: r.domain,
        registered: true,
        hasDependencies: deps.length > 0,
        dependencyCount: deps.length,
        cycles: involved,
      };
    });
  }

  private checkGraphHealth(): GraphHealth {
    const summary = this.platformGraph.getSummary();
    const hasCycles = summary.hasCycles;

    let nodeHealth: GraphHealth['nodeHealth'] = 'healthy';
    let edgeHealth: GraphHealth['edgeHealth'] = 'healthy';

    if (summary.totalNodes === 0) nodeHealth = 'unhealthy';
    else if (hasCycles) nodeHealth = 'degraded';

    if (summary.totalEdges === 0) edgeHealth = 'unhealthy';
    else if (hasCycles) edgeHealth = 'degraded';

    return {
      totalNodes: summary.totalNodes,
      totalEdges: summary.totalEdges,
      hasCycles,
      nodeHealth,
      edgeHealth,
    };
  }
}
