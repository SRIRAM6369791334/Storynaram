export { IntegrationRegistry } from './integration-registry.js';
export type { DomainType, DomainRegistration } from './integration-registry.js';

export { PlatformBootstrap } from './platform-bootstrap.js';
export type { PlatformComponents } from './platform-bootstrap.js';

export { PlatformHealthService } from './platform-health.js';
export type { HealthStatus, DomainHealth, GraphHealth } from './platform-health.js';

export { CrossDomainIntegrationService } from './cross-domain/cross-domain-integration.service.js';
export type { CrossDomainLink, DomainsSummary } from './cross-domain/cross-domain-integration.service.js';

export { CrossDomainValidator } from './cross-domain/cross-domain-validator.js';
export type { ValidationIssue, ValidationRule } from './cross-domain/cross-domain-validator.js';

export { CrossDomainReferenceResolver } from './cross-domain/cross-domain-reference-resolver.js';
export type { ResolvedReference, ReferenceDescriptor } from './cross-domain/cross-domain-reference-resolver.js';

export { DomainEventRouter } from './cross-domain/domain-event-router.js';
export type { DomainEventHandler, RoutingRule } from './cross-domain/domain-event-router.js';

export { ConsistencyValidator } from './cross-domain/consistency-validator.js';
export type { ConsistencyCheck } from './cross-domain/consistency-validator.js';

export { PlatformGraph } from './graph/platform-graph.js';
export type { PlatformGraphSummary } from './graph/platform-graph.js';

export { ReferenceGraph } from './graph/reference-graph.js';
export type { ReferenceGraphEntry } from './graph/reference-graph.js';

export { DependencyGraph } from './graph/dependency-graph.js';
export type { DependencyEntry, DependencyLevel } from './graph/dependency-graph.js';

export { GraphTraversal } from './graph/graph-traversal.js';
export type { GraphNode, GraphEdge } from './graph/graph-traversal.js';

export { CycleDetection } from './graph/cycle-detection.js';
export type { CycleResult } from './graph/cycle-detection.js';

export { ImpactAnalysis } from './graph/impact-analysis.js';
export type { ImpactResult } from './graph/impact-analysis.js';

export { PlatformMetrics } from './observability/platform-metrics.js';
export type { PlatformMetric, MetricSnapshot } from './observability/platform-metrics.js';

export { DomainMetrics } from './observability/domain-metrics.js';
export type { DomainMetricSummary } from './observability/domain-metrics.js';

export { DependencyReportBuilder } from './observability/dependency-report.js';
export type { DependencyReport, DependencyReportEntry } from './observability/dependency-report.js';

export { ValidationReportBuilder } from './observability/validation-report.js';
export type { ValidationReport, ValidationReportEntry } from './observability/validation-report.js';

export { PlatformModule } from './platform.module.js';
