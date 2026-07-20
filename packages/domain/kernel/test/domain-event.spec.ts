import { describe, it, expect } from 'vitest';
import { DomainEvent } from '../src/domain-event';
import { DomainEventDispatcher, IDomainEventHandler } from '../src/domain-event-dispatcher';
import { InMemoryDomainEventPublisher } from '../src/domain-event-publisher';

describe('DomainEvent', () => {
  it('creates with required props', () => {
    const event = new DomainEvent({
      aggregateId: 'agg-1',
      aggregateType: 'Order',
      eventType: 'order.created',
      payload: { total: 100 },
    });
    expect(event.eventId).toBeDefined();
    expect(event.aggregateId).toBe('agg-1');
    expect(event.eventType).toBe('order.created');
    expect(event.payload.total).toBe(100);
  });

  it('accepts custom eventId', () => {
    const event = new DomainEvent({
      eventId: 'custom-id',
      aggregateId: 'agg-1',
      aggregateType: 'Order',
      eventType: 'order.created',
      payload: {},
    });
    expect(event.eventId).toBe('custom-id');
  });

  it('accepts custom timestamp', () => {
    const ts = { toJSON: () => '2024-01-01T00:00:00.000Z' } as any;
    const event = new DomainEvent({
      aggregateId: 'agg-1',
      aggregateType: 'Order',
      eventType: 'order.created',
      payload: {},
      timestamp: ts,
    });
    expect(event.timestamp).toBe(ts);
  });

  it('supports metadata', () => {
    const event = new DomainEvent({
      aggregateId: 'agg-1',
      aggregateType: 'Order',
      eventType: 'order.created',
      payload: {},
      metadata: { correlationId: 'corr-1', tenant: 'acme' },
    });
    expect(event.metadata.correlationId).toBe('corr-1');
    expect(event.metadata.tenant).toBe('acme');
  });

  it('toJSON serializes correctly', () => {
    const event = new DomainEvent({
      eventId: 'e1',
      aggregateId: 'agg-1',
      aggregateType: 'Order',
      eventType: 'order.created',
      payload: { amount: 50 },
      metadata: { correlationId: 'c1' },
    });
    const json = event.toJSON();
    expect(json.eventId).toBe('e1');
    expect(json.aggregateId).toBe('agg-1');
    expect(json.payload).toEqual({ amount: 50 });
  });

  it('fromJSON deserializes correctly', () => {
    const original = new DomainEvent({
      eventId: 'e1',
      aggregateId: 'agg-1',
      aggregateType: 'Order',
      eventType: 'order.created',
      payload: { amount: 50 },
      metadata: { correlationId: 'c1' },
    });
    const json = original.toJSON();
    const restored = DomainEvent.fromJSON(json);
    expect(restored.eventId).toBe('e1');
    expect(restored.aggregateId).toBe('agg-1');
    expect(restored.eventType).toBe('order.created');
    expect(restored.payload).toEqual({ amount: 50 });
  });

  it('withCorrelationId returns new event', () => {
    const event = new DomainEvent({
      aggregateId: 'agg-1',
      aggregateType: 'Order',
      eventType: 'order.created',
      payload: {},
    });
    const withCorr = event.withCorrelationId('new-corr');
    expect(withCorr.metadata.correlationId).toBe('new-corr');
    expect(event.metadata.correlationId).toBeUndefined();
  });
});

describe('DomainEventDispatcher', () => {
  it('dispatches to registered handlers', async () => {
    const dispatcher = new DomainEventDispatcher();
    const handled: string[] = [];

    const handler: IDomainEventHandler = {
      handle: async (event) => {
        handled.push(event.eventType);
      },
    };

    dispatcher.register('order.created', handler);
    const event = new DomainEvent({
      aggregateId: '1',
      aggregateType: 'Order',
      eventType: 'order.created',
      payload: {},
    });
    await dispatcher.dispatch(event);
    expect(handled).toContain('order.created');
  });

  it('dispatches to all registered handlers', async () => {
    const dispatcher = new DomainEventDispatcher();
    let count = 0;

    const handler1: IDomainEventHandler = { handle: async () => { count++; } };
    const handler2: IDomainEventHandler = { handle: async () => { count++; } };

    dispatcher.register('test.event', handler1);
    dispatcher.register('test.event', handler2);

    const event = new DomainEvent({
      aggregateId: '1',
      aggregateType: 'Test',
      eventType: 'test.event',
      payload: {},
    });
    await dispatcher.dispatch(event);
    expect(count).toBe(2);
  });

  it('dispatchAll sends multiple events', async () => {
    const dispatcher = new DomainEventDispatcher();
    const handled: string[] = [];

    dispatcher.register('event.a', { handle: async (e) => { handled.push(e.eventType); } });
    dispatcher.register('event.b', { handle: async (e) => { handled.push(e.eventType); } });

    await dispatcher.dispatchAll([
      new DomainEvent({ aggregateId: '1', aggregateType: 'T', eventType: 'event.a', payload: {} }),
      new DomainEvent({ aggregateId: '2', aggregateType: 'T', eventType: 'event.b', payload: {} }),
    ]);
    expect(handled).toContain('event.a');
    expect(handled).toContain('event.b');
  });

  it('unregister removes handler', async () => {
    const dispatcher = new DomainEventDispatcher();
    let count = 0;
    const handler: IDomainEventHandler = { handle: async () => { count++; } };
    dispatcher.register('test', handler);
    dispatcher.unregister('test', handler);
    const event = new DomainEvent({ aggregateId: '1', aggregateType: 'T', eventType: 'test', payload: {} });
    await dispatcher.dispatch(event);
    expect(count).toBe(0);
  });

  it('clear removes all handlers', () => {
    const dispatcher = new DomainEventDispatcher();
    dispatcher.register('test', { handle: async () => {} });
    dispatcher.clear();
    expect(dispatcher.hasHandlers('test')).toBe(false);
  });
});

describe('InMemoryDomainEventPublisher', () => {
  it('publishes to subscribers', async () => {
    const publisher = new InMemoryDomainEventPublisher();
    const received: string[] = [];

    publisher.subscribe('order.created', async (event) => {
      received.push(event.eventType);
    });

    const event = new DomainEvent({
      aggregateId: '1',
      aggregateType: 'Order',
      eventType: 'order.created',
      payload: {},
    });
    await publisher.publish(event);
    expect(received).toContain('order.created');
  });

  it('publishAll sends multiple events', async () => {
    const publisher = new InMemoryDomainEventPublisher();
    const received: string[] = [];

    publisher.subscribe('event.a', async (e) => { received.push(e.eventType); });
    publisher.subscribe('event.b', async (e) => { received.push(e.eventType); });

    await publisher.publishAll([
      new DomainEvent({ aggregateId: '1', aggregateType: 'T', eventType: 'event.a', payload: {} }),
      new DomainEvent({ aggregateId: '2', aggregateType: 'T', eventType: 'event.b', payload: {} }),
    ]);
    expect(received).toEqual(['event.a', 'event.b']);
  });

  it('unsubscribe removes handler', async () => {
    const publisher = new InMemoryDomainEventPublisher();
    let count = 0;
    const handler = async () => { count++; };
    publisher.subscribe('test', handler);
    publisher.unsubscribe('test', handler);
    await publisher.publish(new DomainEvent({ aggregateId: '1', aggregateType: 'T', eventType: 'test', payload: {} }));
    expect(count).toBe(0);
  });

  it('clear removes all subscribers', async () => {
    const publisher = new InMemoryDomainEventPublisher();
    let count = 0;
    publisher.subscribe('test', async () => { count++; });
    publisher.clear();
    await publisher.publish(new DomainEvent({ aggregateId: '1', aggregateType: 'T', eventType: 'test', payload: {} }));
    expect(count).toBe(0);
  });
});
