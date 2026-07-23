import { RepositoryContract } from '@storynaram/domain-kernel';
import { TimelineAggregate } from './timeline-aggregate.js';
import { TimelineIdentity } from './timeline-identity.js';
import { EventType } from './timeline-event.js';

export interface TimelineRepositoryContract extends RepositoryContract<TimelineAggregate> {
  findByIdentity(identity: TimelineIdentity): Promise<TimelineAggregate | null>;

  findByName(name: string): Promise<TimelineAggregate[]>;

  findByEventType(eventType: EventType): Promise<TimelineAggregate[]>;

  findArchived(): Promise<TimelineAggregate[]>;

  search(query: string): Promise<TimelineAggregate[]>;
}

export const TIMELINE_REPOSITORY = Symbol('TIMELINE_REPOSITORY');
