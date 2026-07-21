export { TimelineIdentity } from './timeline-identity';
export { TimelineEventId } from './timeline-event-id';

export {
  TimelineDate,
  TimelineClock,
  TimelineDuration,
  TimelinePeriod,
} from './timeline-date';

export { TimelineCalendar } from './timeline-calendar';
export type { MonthDefinition } from './timeline-calendar';

export { TimelineEra, TimelineEras } from './timeline-era';

export { TimelineEvent, TimelineEvents } from './timeline-event';
export type { EventType } from './timeline-event';

export { TimelineBranch, TimelineBranches } from './timeline-branch';

export { TimelineStatistics } from './timeline-statistics';
export type { TimelineStatisticsProps } from './timeline-statistics';

export { TimelineAggregate } from './timeline-aggregate';

export {
  TimelineFactory,
} from './timeline-factory';
export type {
  CreateTimelineProps,
  CreateTimelineEventInput,
} from './timeline-factory';

export { TIMELINE_REPOSITORY } from './timeline-repository';
export type { TimelineRepositoryContract } from './timeline-repository';

export { TimelineDomainService } from './timeline-domain-service';

export {
  MainTimelineSpec,
  BranchTimelineSpec,
  HistoricalTimelineSpec,
  CharacterTimelineSpec,
  WorldTimelineSpec,
} from './timeline-specifications';

export {
  TimelineCreatedEvent,
  TimelineEventAddedEvent,
  TimelineBranchCreatedEvent,
  TimelineMergedEvent,
  TimelineArchivedEvent,
} from './timeline-events';

export {
  ChronologicalOrderRule,
  ValidDateRule,
  BranchConsistencyRule,
  CausalityValidationRule,
  CircularDependencyRule,
  ParentBranchRule,
  assertValidEventDate,
} from './business-rules';

export { TimelineDomainModule } from './timeline.module';

export {
  indexTimelineForSearch,
  triggerTimelineWorkflow,
  handleTimelineCreatedIntegration,
  handleTimelineEventAddedIntegration,
} from './integration';
export type { TimelineRuntimeIntegrations } from './integration';
