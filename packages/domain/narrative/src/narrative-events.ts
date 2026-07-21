import { DomainEvent } from '@storynaram/domain-kernel';

export class NarrativeCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { title: string; format: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({ aggregateId, aggregateType: 'Narrative', eventType: 'narrative.created', payload, metadata });
  }
}

export class ChapterAddedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { chapterId: string; title: string; chapterNumber: number },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({ aggregateId, aggregateType: 'Narrative', eventType: 'narrative.chapter.added', payload, metadata });
  }
}

export class SceneAddedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { sceneId: string; chapterId: string; sceneNumber: number; title: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({ aggregateId, aggregateType: 'Narrative', eventType: 'narrative.scene.added', payload, metadata });
  }
}

export class BeatAddedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { beatId: string; sceneId: string; beatNumber: number; beatType: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({ aggregateId, aggregateType: 'Narrative', eventType: 'narrative.beat.added', payload, metadata });
  }
}

export class DialogueAddedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { dialogueId: string; beatId: string; order: number; speaker: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({ aggregateId, aggregateType: 'Narrative', eventType: 'narrative.dialogue.added', payload, metadata });
  }
}

export class NarrativePublishedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { title: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({ aggregateId, aggregateType: 'Narrative', eventType: 'narrative.published', payload, metadata });
  }
}

export class NarrativeArchivedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: { title: string },
    metadata?: { correlationId?: string; tenant?: string; userId?: string },
  ) {
    super({ aggregateId, aggregateType: 'Narrative', eventType: 'narrative.archived', payload, metadata });
  }
}
