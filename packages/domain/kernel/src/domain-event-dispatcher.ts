import { DomainEvent } from './domain-event.js';

export interface IDomainEventHandler {
  handle(event: DomainEvent): Promise<void>;
}

export class DomainEventDispatcher {
  private readonly handlers = new Map<string, Set<IDomainEventHandler>>();

  register(eventType: string, handler: IDomainEventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  unregister(eventType: string, handler: IDomainEventHandler): void {
    this.handlers.get(eventType)?.delete(handler);
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType);
    if (!handlers || handlers.size === 0) return;
    const promises = Array.from(handlers).map(h => h.handle(event));
    await Promise.all(promises);
  }

  async dispatchAll(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map(e => this.dispatch(e)));
  }

  hasHandlers(eventType: string): boolean {
    const handlers = this.handlers.get(eventType);
    return handlers !== undefined && handlers.size > 0;
  }

  clear(): void {
    this.handlers.clear();
  }
}
