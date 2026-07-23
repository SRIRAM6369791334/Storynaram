export { TimelineIdentity } from './timeline-identity.js';
export { TimelineEventId } from './timeline-event-id.js';

export {
  TimelineDate,
  TimelineClock,
  TimelineDuration,
  TimelinePeriod,
} from './timeline-date.js';

export { TimelineCalendar } from './timeline-calendar.js';
export type { MonthDefinition } from './timeline-calendar.js';

export { TimelineEra, TimelineEras } from './timeline-era.js';

export { TimelineEvent, TimelineEvents } from './timeline-event.js';
export type { EventType } from './timeline-event.js';

export { TimelineBranch, TimelineBranches } from './timeline-branch.js';

export { TimelineStatistics } from './timeline-statistics.js';
export type { TimelineStatisticsProps } from './timeline-statistics.js';

export { TimelineAggregate } from './timeline-aggregate.js';

export {
  TimelineFactory,
} from './timeline-factory.js';
export type {
  CreateTimelineProps,
  CreateTimelineEventInput,
} from './timeline-factory.js';

export { TIMELINE_REPOSITORY } from './timeline-repository.js';
export type { TimelineRepositoryContract } from './timeline-repository.js';

export { TimelineDomainService } from './timeline-domain-service.js';

export {
  MainTimelineSpec,
  BranchTimelineSpec,
  HistoricalTimelineSpec,
  CharacterTimelineSpec,
  WorldTimelineSpec,
} from './timeline-specifications.js';

export {
  TimelineCreatedEvent,
  TimelineEventAddedEvent,
  TimelineBranchCreatedEvent,
  TimelineMergedEvent,
  TimelineArchivedEvent,
} from './timeline-events.js';

export {
  ChronologicalOrderRule,
  ValidDateRule,
  BranchConsistencyRule,
  CausalityValidationRule,
  CircularDependencyRule,
  ParentBranchRule,
  assertValidEventDate,
} from './business-rules.js';

export { TimelineDomainModule } from './timeline.module.js';

export {
  indexTimelineForSearch,
  triggerTimelineWorkflow,
  handleTimelineCreatedIntegration,
  handleTimelineEventAddedIntegration,
} from './integration.js';
export type { TimelineRuntimeIntegrations } from './integration.js';
