import { DomainEvent } from '@storynaram/domain-kernel';

export class CharacterCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: Record<string, unknown>,
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'Character',
      eventType: 'character.created',
      payload,
      metadata,
    });
  }
}

export class CharacterUpdatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: Record<string, unknown>,
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'Character',
      eventType: 'character.updated',
      payload,
      metadata,
    });
  }
}

export class CharacterDeletedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload?: Record<string, unknown>,
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'Character',
      eventType: 'character.deleted',
      payload: payload ?? {},
      metadata,
    });
  }
}

export class CharacterRelationshipChangedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { targetId: string; previousType: string; newType: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'Character',
      eventType: 'character.relationship.changed',
      payload,
      metadata,
    });
  }
}

export class CharacterSkillLearnedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { skillName: string; skillLevel: number },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'Character',
      eventType: 'character.skill.learned',
      payload,
      metadata,
    });
  }
}

export class CharacterGoalCompletedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { goalId: string; goalDescription: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({
      aggregateId,
      aggregateType: 'Character',
      eventType: 'character.goal.completed',
      payload,
      metadata,
    });
  }
}
