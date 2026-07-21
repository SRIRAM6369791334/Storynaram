import { describe, it, expect, vi } from 'vitest';
import { DomainEventRouter } from '../src/cross-domain/domain-event-router';
import { IntegrationRegistry } from '../src/integration-registry';
import { DomainEvent } from '@storynaram/domain-kernel';
import type { DomainType } from '../src/integration-registry';

describe('DomainEventRouter', () => {
  it('routes events to registered handlers', async () => {
    const registry = new IntegrationRegistry();
    const router = new DomainEventRouter(registry);
    const handler = vi.fn().mockResolvedValue(undefined);
    router.registerHandler('CharacterCreated', { domain: 'character', handle: handler });
    const event = new DomainEvent({
      eventType: 'CharacterCreated', aggregateId: 'char-1', aggregateType: 'character', payload: { name: 'Frodo' },
    });
    await router.route(event);
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('routes events to rule-based handlers', async () => {
    const registry = new IntegrationRegistry();
    const router = new DomainEventRouter(registry);
    router.addRule({
      sourceEventType: 'CharacterCreated',
      sourceDomain: 'character',
      targetDomain: 'world',
    });
    const event = new DomainEvent({
      eventType: 'CharacterCreated', aggregateId: 'char-1', aggregateType: 'character', payload: {},
    });
    await router.route(event);
  });

  it('handles events with no handlers', async () => {
    const registry = new IntegrationRegistry();
    const router = new DomainEventRouter(registry);
    const event = new DomainEvent({
      eventType: 'UnknownEvent', aggregateId: 'id', aggregateType: 'domain', payload: {},
    });
    await expect(router.route(event)).resolves.toBeUndefined();
  });

  it('routes to multiple handlers', async () => {
    const registry = new IntegrationRegistry();
    const router = new DomainEventRouter(registry);
    const h1 = vi.fn().mockResolvedValue(undefined);
    const h2 = vi.fn().mockResolvedValue(undefined);
    router.registerHandler('StoryEvent', { domain: 'composition', handle: h1 });
    router.registerHandler('StoryEvent', { domain: 'narrative', handle: h2 });
    const event = new DomainEvent({
      eventType: 'StoryEvent', aggregateId: 's-1', aggregateType: 'composition', payload: {},
    });
    await router.route(event);
    expect(h1).toHaveBeenCalledOnce();
    expect(h2).toHaveBeenCalledOnce();
  });

  it('returns registered event types', () => {
    const registry = new IntegrationRegistry();
    const router = new DomainEventRouter(registry);
    router.registerHandler('TypeA', { domain: 'character', handle: async () => {} });
    router.registerHandler('TypeB', { domain: 'world', handle: async () => {} });
    const types = router.getRegisteredEventTypes();
    expect(types).toContain('TypeA');
    expect(types).toContain('TypeB');
  });

  it('returns routing rules', () => {
    const registry = new IntegrationRegistry();
    const router = new DomainEventRouter(registry);
    router.addRule({
      sourceEventType: 'E1', sourceDomain: 'a' as DomainType, targetDomain: 'b' as DomainType,
    });
    expect(router.getRules()).toHaveLength(1);
  });
});
