import { DomainEvent } from './domain-event';

export interface IDomainEventPublisher {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
}

export class InMemoryDomainEventPublisher implements IDomainEventPublisher {
  private readonly subscribers = new Map<string, Set<(event: DomainEvent) => Promise<void>>>();

  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(handler);
  }

  unsubscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    this.subscribers.get(eventType)?.delete(handler);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.subscribers.get(event.eventType);
    if (!handlers || handlers.size === 0) return;
    const promises = Array.from(handlers).map(h => h(event));
    await Promise.all(promises);
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map(e => this.publish(e)));
  }

  clear(): void {
    this.subscribers.clear();
  }
}
