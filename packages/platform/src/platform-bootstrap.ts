import { IntegrationRegistry, DomainRegistration, DomainType } from './integration-registry';
import { CrossDomainIntegrationService } from './cross-domain/cross-domain-integration.service';
import { CrossDomainValidator } from './cross-domain/cross-domain-validator';
import { CrossDomainReferenceResolver } from './cross-domain/cross-domain-reference-resolver';
import { DomainEventRouter } from './cross-domain/domain-event-router';
import { ConsistencyValidator } from './cross-domain/consistency-validator';
import { ReferenceGraph } from './graph/reference-graph';
import { DependencyGraph } from './graph/dependency-graph';
import { ImpactAnalysis } from './graph/impact-analysis';
import { PlatformGraph } from './graph/platform-graph';
import { PlatformHealthService } from './platform-health';
import { PlatformMetrics } from './observability/platform-metrics';
import { DomainMetrics } from './observability/domain-metrics';
import { DependencyReportBuilder } from './observability/dependency-report';
import { ValidationReportBuilder } from './observability/validation-report';

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
