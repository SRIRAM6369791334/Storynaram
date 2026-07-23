import { Specification } from '@storynaram/domain-kernel';
import { TimelineAggregate } from './timeline-aggregate.js';

export class MainTimelineSpec extends Specification<TimelineAggregate> {
  isSatisfiedBy(candidate: TimelineAggregate): boolean {
    return candidate.branches.main.isActive && !candidate.isArchived;
  }
}

export class BranchTimelineSpec extends Specification<TimelineAggregate> {
  isSatisfiedBy(candidate: TimelineAggregate): boolean {
    return candidate.branches.count > 1;
  }
}

export class HistoricalTimelineSpec extends Specification<TimelineAggregate> {
  isSatisfiedBy(candidate: TimelineAggregate): boolean {
    return candidate.eventsOfType('historical').length > 0;
  }
}

export class CharacterTimelineSpec extends Specification<TimelineAggregate> {
  isSatisfiedBy(candidate: TimelineAggregate): boolean {
    return candidate.eventsOfType('character').length > 0;
  }
}

export class WorldTimelineSpec extends Specification<TimelineAggregate> {
  isSatisfiedBy(candidate: TimelineAggregate): boolean {
    return candidate.eventsOfType('world').length > 0;
  }
}
