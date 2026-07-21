export { IntegrationRegistry } from './integration-registry';
export type { DomainType, DomainRegistration } from './integration-registry';

export { PlatformBootstrap } from './platform-bootstrap';
export type { PlatformComponents } from './platform-bootstrap';

export { PlatformHealthService } from './platform-health';
export type { HealthStatus, DomainHealth, GraphHealth } from './platform-health';

export { CrossDomainIntegrationService } from './cross-domain/cross-domain-integration.service';
export type { CrossDomainLink, DomainsSummary } from './cross-domain/cross-domain-integration.service';

export { CrossDomainValidator } from './cross-domain/cross-domain-validator';
export type { ValidationIssue, ValidationRule } from './cross-domain/cross-domain-validator';

export { CrossDomainReferenceResolver } from './cross-domain/cross-domain-reference-resolver';
export type { ResolvedReference, ReferenceDescriptor } from './cross-domain/cross-domain-reference-resolver';

export { DomainEventRouter } from './cross-domain/domain-event-router';
export type { DomainEventHandler, RoutingRule } from './cross-domain/domain-event-router';

export { ConsistencyValidator } from './cross-domain/consistency-validator';
export type { ConsistencyCheck } from './cross-domain/consistency-validator';

export { PlatformGraph } from './graph/platform-graph';
export type { PlatformGraphSummary } from './graph/platform-graph';

export { ReferenceGraph } from './graph/reference-graph';
export type { ReferenceGraphEntry } from './graph/reference-graph';

export { DependencyGraph } from './graph/dependency-graph';
export type { DependencyEntry, DependencyLevel } from './graph/dependency-graph';

export { GraphTraversal } from './graph/graph-traversal';
export type { GraphNode, GraphEdge } from './graph/graph-traversal';

export { CycleDetection } from './graph/cycle-detection';
export type { CycleResult } from './graph/cycle-detection';

export { ImpactAnalysis } from './graph/impact-analysis';
export type { ImpactResult } from './graph/impact-analysis';

export { PlatformMetrics } from './observability/platform-metrics';
export type { PlatformMetric, MetricSnapshot } from './observability/platform-metrics';

export { DomainMetrics } from './observability/domain-metrics';
export type { DomainMetricSummary } from './observability/domain-metrics';

export { DependencyReportBuilder } from './observability/dependency-report';
export type { DependencyReport, DependencyReportEntry } from './observability/dependency-report';

export { ValidationReportBuilder } from './observability/validation-report';
export type { ValidationReport, ValidationReportEntry } from './observability/validation-report';

export { PlatformModule } from './platform.module';
