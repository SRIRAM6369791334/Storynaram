import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { PlatformBootstrap } from './platform-bootstrap';
import { IntegrationRegistry } from './integration-registry';
import { CrossDomainIntegrationService } from './cross-domain/cross-domain-integration.service';
import { CrossDomainValidator } from './cross-domain/cross-domain-validator';
import { CrossDomainReferenceResolver } from './cross-domain/cross-domain-reference-resolver';
import { DomainEventRouter } from './cross-domain/domain-event-router';
import { ConsistencyValidator } from './cross-domain/consistency-validator';
import { PlatformGraph } from './graph/platform-graph';
import { ReferenceGraph } from './graph/reference-graph';
import { DependencyGraph } from './graph/dependency-graph';
import { ImpactAnalysis } from './graph/impact-analysis';
import { PlatformHealthService } from './platform-health';
import { PlatformMetrics } from './observability/platform-metrics';
import { DomainMetrics } from './observability/domain-metrics';
import { DependencyReportBuilder } from './observability/dependency-report';
import { ValidationReportBuilder } from './observability/validation-report';

@Global()
@Module({})
export class PlatformModule {
  static forRoot(): DynamicModule {
    const bootstrap = new PlatformBootstrap();
    const components = bootstrap.initialize();

    const providers: Provider[] = [
      { provide: PlatformBootstrap, useValue: bootstrap },
      { provide: IntegrationRegistry, useValue: components.registry },
      { provide: CrossDomainIntegrationService, useValue: components.crossDomainService },
      { provide: CrossDomainValidator, useValue: components.validator },
      { provide: CrossDomainReferenceResolver, useValue: components.referenceResolver },
      { provide: DomainEventRouter, useValue: components.eventRouter },
      { provide: ConsistencyValidator, useValue: components.consistencyValidator },
      { provide: PlatformGraph, useValue: components.platformGraph },
      { provide: ReferenceGraph, useValue: components.referenceGraph },
      { provide: DependencyGraph, useValue: components.dependencyGraph },
      { provide: ImpactAnalysis, useValue: components.impactAnalysis },
      { provide: PlatformHealthService, useValue: components.healthService },
      { provide: PlatformMetrics, useValue: components.metrics },
      { provide: DomainMetrics, useValue: components.domainMetrics },
      { provide: DependencyReportBuilder, useValue: components.dependencyReportBuilder },
      { provide: ValidationReportBuilder, useValue: components.validationReportBuilder },
    ];

    return {
      module: PlatformModule,
      providers,
      exports: providers.map(p => (p as { provide: unknown }).provide ?? p) as any,
    };
  }

  static forFeature(): DynamicModule {
    return { module: PlatformModule };
  }
}
