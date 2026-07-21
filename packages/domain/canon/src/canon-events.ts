import { DomainEvent } from '@storynaram/domain-kernel';

export class CanonCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { name: string; description: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'Canon',
      eventType: 'canon.created',
      payload,
      metadata,
    });
  }
}

export class FactAddedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { entryId: string; factType: string; key: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'Canon',
      eventType: 'canon.fact.added',
      payload,
      metadata,
    });
  }
}

export class FactUpdatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { entryId: string; key: string; version: number },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'Canon',
      eventType: 'canon.fact.updated',
      payload,
      metadata,
    });
  }
}

export class ConflictDetectedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { conflictId: string; entryId: string; key: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'Canon',
      eventType: 'canon.conflict.detected',
      payload,
      metadata,
    });
  }
}

export class ConflictResolvedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { conflictId: string; entryId: string; strategy: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'Canon',
      eventType: 'canon.conflict.resolved',
      payload,
      metadata,
    });
  }
}

export class CanonPublishedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { name: string; entryCount: number },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'Canon',
      eventType: 'canon.published',
      payload,
      metadata,
    });
  }
}
