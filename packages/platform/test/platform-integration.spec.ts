import { describe, it, expect } from 'vitest';
import { PlatformBootstrap } from '../src/platform-bootstrap';
import { DomainEvent } from '@storynaram/domain-kernel';
import type { DomainType } from '../src/integration-registry';

describe('Platform Full Integration', () => {
  it('boots, registers all domains, and validates', async () => {
    const bootstrap = new PlatformBootstrap();
    bootstrap.initialize();

    const domains = [
      { domain: 'character' as const, name: 'Character Domain', version: '1.0.0', repository: {}, dependencies: [] as DomainType[], events: ['CharacterCreated', 'CharacterUpdated'] },
      { domain: 'world' as const, name: 'World Domain', version: '1.0.0', repository: {}, dependencies: ['character' as DomainType], events: ['WorldCreated'] },
      { domain: 'timeline' as const, name: 'Timeline Domain', version: '1.0.0', repository: {}, dependencies: ['character' as DomainType, 'world' as DomainType], events: ['TimelineEvent'] },
      { domain: 'canon' as const, name: 'Canon Domain', version: '1.0.0', repository: {}, dependencies: ['character' as DomainType, 'world' as DomainType, 'timeline' as DomainType], events: ['CanonUpdated'] },
      { domain: 'narrative' as const, name: 'Narrative Domain', version: '1.0.0', repository: {}, dependencies: ['character' as DomainType, 'world' as DomainType, 'timeline' as DomainType, 'canon' as DomainType], events: [] },
      { domain: 'composition' as const, name: 'Composition Domain', version: '1.0.0', repository: {}, dependencies: ['narrative' as DomainType], events: ['StoryCreated'] },
    ];

    for (const d of domains) {
      bootstrap.registerDomain(d);
    }

    const components = bootstrap.getComponents();

    expect(components.registry.getDomainCount()).toBe(6);
    expect(components.dependencyGraph.getDomainCount()).toBeGreaterThanOrEqual(6);

    const levels = components.dependencyGraph.getTopologicalLevels();
    expect(levels.length).toBeGreaterThan(0);

    const health = components.healthService.check();
    expect(health.status).toBe('healthy');

    const summary = components.crossDomainService.getSummary();
    expect(summary.registered).toHaveLength(6);
  });

  it('routes events across domains', async () => {
    const bootstrap = new PlatformBootstrap();
    bootstrap.initialize();

    bootstrap.registerDomain({
      domain: 'character', name: '', version: '', repository: {}, dependencies: [], events: ['CharacterCreated'],
    });
    bootstrap.registerDomain({
      domain: 'world', name: '', version: '', repository: {}, dependencies: ['character'], events: ['CharacterCreated'],
    });

    const components = bootstrap.getComponents();

    let worldHandled = false;
    components.eventRouter.registerHandler('CharacterCreated', {
      domain: 'world',
      handle: async () => { worldHandled = true; },
    });

    const event = new DomainEvent({
      eventType: 'CharacterCreated', aggregateId: 'gandalf', aggregateType: 'character', payload: { name: 'Gandalf' },
    });
    await components.eventRouter.route(event);
    expect(worldHandled).toBe(true);
  });

  it('validates cross-domain references', async () => {
    const bootstrap = new PlatformBootstrap();
    bootstrap.initialize();

    bootstrap.registerDomain({
      domain: 'character', name: '', version: '', repository: {}, dependencies: [], events: [],
    });

    const components = bootstrap.getComponents();

    let resolved = false;
    components.referenceResolver.registerResolver('character', 'hero', async (id) => {
      resolved = true;
      return { exists: true, label: `Hero ${id}` };
    });

    const result = await components.referenceResolver.resolve({
      domain: 'character', entityId: 'frodo', entityType: 'hero',
    });

    expect(resolved).toBe(true);
    expect(result.exists).toBe(true);
  });

  it('performs consistency checks', async () => {
    const bootstrap = new PlatformBootstrap();
    bootstrap.initialize();

    bootstrap.registerDomain({
      domain: 'character', name: '', version: '', repository: {}, dependencies: [], events: [],
    });

    const components = bootstrap.getComponents();

    components.consistencyValidator.addCheck(async () => ({
      checkName: 'all-characters-have-names',
      description: 'Every character must have a name',
      domains: ['character'],
      passed: true,
      details: ['All characters have names'],
    }));

    const consistent = await components.consistencyValidator.isConsistent();
    expect(consistent).toBe(true);
  });

  it('generates dependency and validation reports', async () => {
    const bootstrap = new PlatformBootstrap();
    bootstrap.initialize();

    bootstrap.registerDomain({
      domain: 'character', name: '', version: '', repository: {}, dependencies: [], events: [],
    });
    bootstrap.registerDomain({
      domain: 'world', name: '', version: '', repository: {}, dependencies: ['character'], events: [],
    });

    const components = bootstrap.getComponents();

    const depReport = components.dependencyReportBuilder.build(components.dependencyGraph);
    expect(depReport.totalDomains).toBeGreaterThanOrEqual(2);

    components.validator.addRule({
      name: 'check-hero',
      domain: 'character',
      validate: async () => [{
        domain: 'character', entityId: '1', entityType: 'hero',
        issue: 'Missing backstory', severity: 'warning',
      }],
    });

    const issues = await components.validator.validateAll();
    const validationReport = components.validationReportBuilder.build(issues, []);
    expect(validationReport.totalIssues).toBe(1);
  });

  it('collects domain metrics through lifecycle', () => {
    const bootstrap = new PlatformBootstrap();
    bootstrap.initialize();

    bootstrap.registerDomain({
      domain: 'character', name: '', version: '', repository: {}, dependencies: [], events: [],
    });

    const components = bootstrap.getComponents();

    components.domainMetrics.recordEntityCreated('character', 'hero');
    components.domainMetrics.recordEventRouted('character', 'world', 'CharacterCreated');
    components.domainMetrics.recordValidationIssue('character', 'error');

    const summary = components.domainMetrics.getSummary('character');
    expect(summary.entityCount).toBe(1);
    expect(summary.eventCount).toBe(1);
    expect(summary.validationErrors).toBe(1);
    expect(summary.lastActivity).not.toBeNull();
  });
});
