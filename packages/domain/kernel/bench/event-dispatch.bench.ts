import { bench, describe } from 'vitest';
import { DomainEvent } from '../src/domain-event';
import { DomainEventDispatcher, IDomainEventHandler } from '../src/domain-event-dispatcher';
import { InMemoryDomainEventPublisher } from '../src/domain-event-publisher';

describe('Event dispatch', () => {
  const dispatcher = new DomainEventDispatcher();
  const publisher = new InMemoryDomainEventPublisher();
  const events: DomainEvent[] = [];

  for (let i = 0; i < 100; i++) {
    events.push(new DomainEvent({
      aggregateId: String(i),
      aggregateType: 'Bench',
      eventType: `event.${i}`,
      payload: { index: i },
    }));
  }

  const noopHandler: IDomainEventHandler = { handle: async () => {} };

  for (let i = 0; i < 100; i++) {
    dispatcher.register(`event.${i}`, noopHandler);
    publisher.subscribe(`event.${i}`, async () => {});
  }

  bench('dispatch 100 events sequentially', async () => {
    for (const event of events) {
      await dispatcher.dispatch(event);
    }
  });

  bench('publish 100 events sequentially', async () => {
    for (const event of events) {
      await publisher.publish(event);
    }
  });

  bench('dispatchAll 100 events', async () => {
    await dispatcher.dispatchAll(events);
  });

  bench('publishAll 100 events', async () => {
    await publisher.publishAll(events);
  });
});
