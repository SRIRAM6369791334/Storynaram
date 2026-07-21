import { describe, it, expect } from 'vitest';
import { PlatformMetrics } from '../src/observability/platform-metrics';
import { DomainMetrics } from '../src/observability/domain-metrics';
import { IntegrationRegistry } from '../src/integration-registry';

describe('DomainMetrics', () => {
  it('records entity lifecycle events', () => {
    const registry = new IntegrationRegistry();
    registry.register({
      domain: 'character', name: '', version: '', repository: {}, dependencies: [], events: [],
    });
    const metrics = new PlatformMetrics();
    const domainMetrics = new DomainMetrics(metrics, registry);
    domainMetrics.recordEntityCreated('character', 'hero');
    domainMetrics.recordEntityUpdated('character', 'hero');
    domainMetrics.recordEntityDeleted('character', 'hero');
    expect(metrics.getCounter('domain.entity.created', { domain: 'character', entityType: 'hero' })).toBe(1);
    expect(metrics.getCounter('domain.entity.updated', { domain: 'character', entityType: 'hero' })).toBe(1);
    expect(metrics.getCounter('domain.entity.deleted', { domain: 'character', entityType: 'hero' })).toBe(1);
  });

  it('records event routing', () => {
    const registry = new IntegrationRegistry();
    const metrics = new PlatformMetrics();
    const domainMetrics = new DomainMetrics(metrics, registry);
    domainMetrics.recordEventRouted('character', 'world', 'CharacterCreated');
    expect(metrics.getCounter('domain.event.routed', {
      sourceDomain: 'character', targetDomain: 'world', eventType: 'CharacterCreated',
    })).toBe(1);
  });

  it('records validation issues', () => {
    const registry = new IntegrationRegistry();
    const metrics = new PlatformMetrics();
    const domainMetrics = new DomainMetrics(metrics, registry);
    domainMetrics.recordValidationIssue('character', 'error');
    expect(metrics.getCounter('domain.validation.issue', { domain: 'character', severity: 'error' })).toBe(1);
  });

  it('records reference resolution', () => {
    const registry = new IntegrationRegistry();
    const metrics = new PlatformMetrics();
    const domainMetrics = new DomainMetrics(metrics, registry);
    domainMetrics.recordReferenceResolved('character', true);
    domainMetrics.recordReferenceResolved('character', false);
    expect(metrics.getCounter('domain.reference.resolved', { domain: 'character', success: 'true' })).toBe(1);
    expect(metrics.getCounter('domain.reference.resolved', { domain: 'character', success: 'false' })).toBe(1);
  });

  it('records graph operations', () => {
    const registry = new IntegrationRegistry();
    const metrics = new PlatformMetrics();
    const domainMetrics = new DomainMetrics(metrics, registry);
    domainMetrics.recordGraphOperation('rebuild');
    expect(metrics.getCounter('graph.operation', { operation: 'rebuild' })).toBe(1);
  });

  it('returns summary for a domain', () => {
    const registry = new IntegrationRegistry();
    registry.register({
      domain: 'character', name: '', version: '', repository: {}, dependencies: [], events: [],
    });
    const metrics = new PlatformMetrics();
    const domainMetrics = new DomainMetrics(metrics, registry);
    const summary = domainMetrics.getSummary('character');
    expect(summary.domain).toBe('character');
    expect(summary.entityCount).toBe(0);
    expect(summary.lastActivity).toBeNull();
  });

  it('returns all summaries', () => {
    const registry = new IntegrationRegistry();
    registry.register({
      domain: 'character', name: '', version: '', repository: {}, dependencies: [], events: [],
    });
    registry.register({
      domain: 'world', name: '', version: '', repository: {}, dependencies: [], events: [],
    });
    const metrics = new PlatformMetrics();
    const domainMetrics = new DomainMetrics(metrics, registry);
    domainMetrics.recordEntityCreated('character', 'hero');
    const summaries = domainMetrics.getAllSummaries();
    expect(summaries).toHaveLength(2);
  });
});
