import { DomainEvent } from '@storynaram/domain-kernel';

export class WorldCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: Record<string, unknown>,
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'World',
      eventType: 'world.created',
      payload,
      metadata,
    });
  }
}

export class RegionAddedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { regionId: string; regionName: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'World',
      eventType: 'world.region.added',
      payload,
      metadata,
    });
  }
}

export class FactionCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { factionId: string; factionName: string; factionType: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'World',
      eventType: 'world.faction.created',
      payload,
      metadata,
    });
  }
}

export class MagicSystemChangedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { magicSystemName: string; magicType: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'World',
      eventType: 'world.magic.system.changed',
      payload,
      metadata,
    });
  }
}

export class CultureUpdatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { cultureId: string; cultureName: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'World',
      eventType: 'world.culture.updated',
      payload,
      metadata,
    });
  }
}

export class WorldDeletedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload?: Record<string, unknown>,
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'World',
      eventType: 'world.deleted',
      payload: payload ?? {},
      metadata,
    });
  }
}

export class HistoryRecordedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { eventId: string; eventTitle: string; significance: number },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'World',
      eventType: 'world.history.recorded',
      payload,
      metadata,
    });
  }
}
