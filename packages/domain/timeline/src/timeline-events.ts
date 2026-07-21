import { DomainEvent } from '@storynaram/domain-kernel';

export class TimelineCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { name: string; description: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'Timeline',
      eventType: 'timeline.created',
      payload,
      metadata,
    });
  }
}

export class TimelineEventAddedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { eventId: string; title: string; eventType: string; date: Record<string, unknown> },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'Timeline',
      eventType: 'timeline.event.added',
      payload,
      metadata,
    });
  }
}

export class TimelineBranchCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { branchId: string; branchName: string; parentBranchId?: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'Timeline',
      eventType: 'timeline.branch.created',
      payload,
      metadata,
    });
  }
}

export class TimelineMergedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { sourceBranchId: string; targetBranchId: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'Timeline',
      eventType: 'timeline.merged',
      payload,
      metadata,
    });
  }
}

export class TimelineArchivedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload?: Record<string, unknown>,
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'Timeline',
      eventType: 'timeline.archived',
      payload: payload ?? {},
      metadata,
    });
  }
}
