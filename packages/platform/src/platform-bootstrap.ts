import { IntegrationRegistry, DomainRegistration, DomainType } from './integration-registry.js';
import { CrossDomainIntegrationService } from './cross-domain/cross-domain-integration.service.js';
import { CrossDomainValidator } from './cross-domain/cross-domain-validator.js';
import { CrossDomainReferenceResolver } from './cross-domain/cross-domain-reference-resolver.js';
import { DomainEventRouter } from './cross-domain/domain-event-router.js';
import { ConsistencyValidator } from './cross-domain/consistency-validator.js';
import { ReferenceGraph } from './graph/reference-graph.js';
import { DependencyGraph } from './graph/dependency-graph.js';
import { ImpactAnalysis } from './graph/impact-analysis.js';
import { PlatformGraph } from './graph/platform-graph.js';
import { PlatformHealthService } from './platform-health.js';
import { PlatformMetrics } from './observability/platform-metrics.js';
import { DomainMetrics } from './observability/domain-metrics.js';
import { DependencyReportBuilder } from './observability/dependency-report.js';
import { ValidationReportBuilder } from './observability/validation-report.js';

export interface PlatformComponents {
  registry: IntegrationRegistry;
  crossDomainService: CrossDomainIntegrationService;
  validator: CrossDomainValidator;
  referenceResolver: CrossDomainReferenceResolver;
  eventRouter: DomainEventRouter;
  consistencyValidator: ConsistencyValidator;
  referenceGraph: ReferenceGraph;
  dependencyGraph: DependencyGraph;
  impactAnalysis: ImpactAnalysis;
  platformGraph: PlatformGraph;
  healthService: PlatformHealthService;
  metrics: PlatformMetrics;
  domainMetrics: DomainMetrics;
  dependencyReportBuilder: DependencyReportBuilder;
  validationReportBuilder: ValidationReportBuilder;
}

export class PlatformBootstrap {
  private components: PlatformComponents | null = null;

  initialize(): PlatformComponents {
    const registry = new IntegrationRegistry();
    const metrics = new PlatformMetrics();
    const referenceGraph = new ReferenceGraph();
    const dependencyGraph = new DependencyGraph();
    const graphTraversal = referenceGraph.getTraversal();
    const referenceResolver = new CrossDomainReferenceResolver(registry);
    const eventRouter = new DomainEventRouter(registry);
    const validator = new CrossDomainValidator(registry);
    const consistencyValidator = new ConsistencyValidator(registry);
    const crossDomainService = new CrossDomainIntegrationService(
      registry, validator, referenceResolver, eventRouter, consistencyValidator,
    );
    const impactAnalysis = new ImpactAnalysis(referenceGraph, dependencyGraph);
    const platformGraph = new PlatformGraph(referenceGraph, dependencyGraph, impactAnalysis);
    const healthService = new PlatformHealthService(registry, platformGraph);
    const domainMetrics = new DomainMetrics(metrics, registry);
    const dependencyReportBuilder = new DependencyReportBuilder();
    const validationReportBuilder = new ValidationReportBuilder();

    this.components = {
      registry, crossDomainService, validator, referenceResolver,
      eventRouter, consistencyValidator, referenceGraph, dependencyGraph,
      impactAnalysis, platformGraph, healthService, metrics, domainMetrics,
      dependencyReportBuilder, validationReportBuilder,
    };

    return this.components;
  }

  registerDomain(registration: DomainRegistration): void {
    if (!this.components) throw new Error('Platform not initialized');
    this.components.registry.register(registration);
    this.components.dependencyGraph.addDependencies(registration.domain, registration.dependencies);
  }

  getComponents(): PlatformComponents {
    if (!this.components) throw new Error('Platform not initialized');
    return this.components;
  }
}
