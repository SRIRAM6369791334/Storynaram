import { DomainEvent } from '@storynaram/domain-kernel';

export class StoryCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { title: string; format: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({ aggregateId, aggregateType: 'Story', eventType: 'story.created', payload, metadata });
  }
}

export class PlotCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { plotId: string; structure: string; plotType: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({ aggregateId, aggregateType: 'Story', eventType: 'story.plot.created', payload, metadata });
  }
}

export class PlotPointAddedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { pointId: string; stage: string; order: number; title: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({ aggregateId, aggregateType: 'Story', eventType: 'story.plot.point.added', payload, metadata });
  }
}

export class ArcCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { arcId: string; name: string; stage: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({ aggregateId, aggregateType: 'Story', eventType: 'story.arc.created', payload, metadata });
  }
}

export class CharacterArcCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { characterArcId: string; characterId: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({ aggregateId, aggregateType: 'Story', eventType: 'story.characterArc.created', payload, metadata });
  }
}

export class ConflictAddedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { conflictId: string; category: string; severity: string; description: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({ aggregateId, aggregateType: 'Story', eventType: 'story.conflict.added', payload, metadata });
  }
}

export class ConflictResolvedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { conflictId: string; resolution: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({ aggregateId, aggregateType: 'Story', eventType: 'story.conflict.resolved', payload, metadata });
  }
}

export class ThemeAddedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { themeId: string; category: string; statement: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({ aggregateId, aggregateType: 'Story', eventType: 'story.theme.added', payload, metadata });
  }
}

export class ForeshadowAddedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { foreshadowId: string; clue: string; strength: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({ aggregateId, aggregateType: 'Story', eventType: 'story.foreshadow.added', payload, metadata });
  }
}

export class PayoffResolvedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { payoffId: string; foreshadowId: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({ aggregateId, aggregateType: 'Story', eventType: 'story.payoff.resolved', payload, metadata });
  }
}

export class StoryCompletedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { title: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({ aggregateId, aggregateType: 'Story', eventType: 'story.completed', payload, metadata });
  }
}

export class StoryPublishedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { title: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({ aggregateId, aggregateType: 'Story', eventType: 'story.published', payload, metadata });
  }
}
