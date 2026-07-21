import { describe, it, expect } from 'vitest';
import { CrossDomainIntegrationService } from '../src/cross-domain/cross-domain-integration.service';
import { IntegrationRegistry } from '../src/integration-registry';
import { CrossDomainValidator } from '../src/cross-domain/cross-domain-validator';
import { CrossDomainReferenceResolver } from '../src/cross-domain/cross-domain-reference-resolver';
import { DomainEventRouter } from '../src/cross-domain/domain-event-router';
import { ConsistencyValidator } from '../src/cross-domain/consistency-validator';

describe('CrossDomainIntegrationService', () => {
  it('creates instance and returns getters', () => {
    const registry = new IntegrationRegistry();
    const validator = new CrossDomainValidator(registry);
    const refResolver = new CrossDomainReferenceResolver(registry);
    const eventRouter = new DomainEventRouter(registry);
    const consistencyValidator = new ConsistencyValidator(registry);
    const service = new CrossDomainIntegrationService(
      registry, validator, refResolver, eventRouter, consistencyValidator,
    );
    expect(service.getValidator()).toBe(validator);
    expect(service.getReferenceResolver()).toBe(refResolver);
    expect(service.getEventRouter()).toBe(eventRouter);
    expect(service.getConsistencyValidator()).toBe(consistencyValidator);
    expect(service.getRegistry()).toBe(registry);
  });

  it('returns summary with no registrations', () => {
    const registry = new IntegrationRegistry();
    const service = new CrossDomainIntegrationService(
      registry,
      new CrossDomainValidator(registry),
      new CrossDomainReferenceResolver(registry),
      new DomainEventRouter(registry),
      new ConsistencyValidator(registry),
    );
    const summary = service.getSummary();
    expect(summary.registered).toHaveLength(0);
    expect(summary.eventRoutes).toBe(0);
    expect(summary.validationRules).toBe(0);
    expect(summary.consistencyChecks).toBe(0);
    expect(summary.resolvers).toBe(0);
  });

  it('returns summary with registrations', () => {
    const registry = new IntegrationRegistry();
    registry.register({
      domain: 'character', name: 'C', version: '1', repository: {}, dependencies: [], events: [],
    });
    const validator = new CrossDomainValidator(registry);
    validator.addRule({ name: 'r1', domain: 'character', validate: async () => [] });
    const refResolver = new CrossDomainReferenceResolver(registry);
    refResolver.registerResolver('character', 'hero', async () => ({ exists: true, label: '' }));
    const eventRouter = new DomainEventRouter(registry);
    eventRouter.registerHandler('Event', { domain: 'character', handle: async () => {} });
    const consistencyValidator = new ConsistencyValidator(registry);
    consistencyValidator.addCheck(async () => ({
      checkName: 'c1', description: '', domains: ['character'], passed: true, details: [],
    }));
    const service = new CrossDomainIntegrationService(
      registry, validator, refResolver, eventRouter, consistencyValidator,
    );
    const summary = service.getSummary();
    expect(summary.registered).toEqual(['character']);
    expect(summary.eventRoutes).toBe(1);
    expect(summary.validationRules).toBe(1);
    expect(summary.consistencyChecks).toBe(1);
    expect(summary.resolvers).toBe(1);
  });
});
