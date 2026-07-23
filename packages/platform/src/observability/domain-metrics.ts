import { PlatformMetrics } from './platform-metrics.js';
import { IntegrationRegistry, DomainType } from '../integration-registry.js';

export interface DomainMetricSummary {
  domain: DomainType;
  entityCount: number;
  eventCount: number;
  referenceCount: number;
  validationErrors: number;
  lastActivity: Date | null;
}

export class DomainMetrics {
  private readonly domainActivity = new Map<DomainType, Date>();

  constructor(
    private readonly metrics: PlatformMetrics,
    private readonly registry: IntegrationRegistry,
  ) {}

  recordEntityCreated(domain: DomainType, entityType: string): void {
    this.metrics.incrementCounter('domain.entity.created', { domain, entityType });
    this.recordActivity(domain);
  }

  recordEntityUpdated(domain: DomainType, entityType: string): void {
    this.metrics.incrementCounter('domain.entity.updated', { domain, entityType });
    this.recordActivity(domain);
  }

  recordEntityDeleted(domain: DomainType, entityType: string): void {
    this.metrics.incrementCounter('domain.entity.deleted', { domain, entityType });
    this.recordActivity(domain);
  }

  recordEventRouted(sourceDomain: DomainType, targetDomain: DomainType, eventType: string): void {
    this.metrics.incrementCounter('domain.event.routed', { sourceDomain, targetDomain, eventType });
  }

  recordValidationIssue(domain: DomainType, severity: string): void {
    this.metrics.incrementCounter('domain.validation.issue', { domain, severity });
  }

  recordReferenceResolved(domain: DomainType, success: boolean): void {
    this.metrics.incrementCounter('domain.reference.resolved', { domain, success: String(success) });
  }

  recordGraphOperation(operation: string): void {
    this.metrics.incrementCounter('graph.operation', { operation });
  }

  getSummary(domain: DomainType): DomainMetricSummary {
    const allMetrics = this.metrics.getSnapshot().metrics;
    const entityCount = allMetrics.filter(
      m => m.name === 'domain.entity.created' && m.tags.domain === domain,
    ).length;
    const eventCount = allMetrics.filter(
      m => m.name === 'domain.event.routed' && m.tags.sourceDomain === domain,
    ).length;
    const referenceCount = allMetrics.filter(
      m => m.name === 'domain.reference.resolved' && m.tags.domain === domain && m.tags.success === 'true',
    ).length;
    const validationErrors = allMetrics.filter(
      m => m.name === 'domain.validation.issue' && m.tags.domain === domain && m.tags.severity === 'error',
    ).length;

    return {
      domain,
      entityCount,
      eventCount,
      referenceCount,
      validationErrors,
      lastActivity: this.domainActivity.get(domain) ?? null,
    };
  }

  getAllSummaries(): DomainMetricSummary[] {
    return this.registry.getAll().map(r => this.getSummary(r.domain));
  }

  private recordActivity(domain: DomainType): void {
    this.domainActivity.set(domain, new Date());
  }
}
