import { Specification } from '@storynaram/domain-kernel';
import { StoryAggregate } from './story-aggregate';

export class DraftSpec extends Specification<StoryAggregate> {
  isSatisfiedBy(candidate: StoryAggregate): boolean {
    return candidate.state.phase === 'concept' || candidate.state.phase === 'outline';
  }
}

export class PlanningSpec extends Specification<StoryAggregate> {
  isSatisfiedBy(candidate: StoryAggregate): boolean {
    return candidate.state.phase === 'development';
  }
}

export class WritingSpec extends Specification<StoryAggregate> {
  isSatisfiedBy(candidate: StoryAggregate): boolean {
    return candidate.state.phase === 'drafting' || candidate.state.phase === 'revision';
  }
}

export class CompletedSpec extends Specification<StoryAggregate> {
  isSatisfiedBy(candidate: StoryAggregate): boolean {
    return candidate.state.isComplete;
  }
}

export class PublishedSpec extends Specification<StoryAggregate> {
  isSatisfiedBy(candidate: StoryAggregate): boolean {
    return candidate.state.isPublished;
  }
}

export class StandaloneSpec extends Specification<StoryAggregate> {
  isSatisfiedBy(candidate: StoryAggregate): boolean {
    return candidate.profile.isStandalone;
  }
}

export class SeriesSpec extends Specification<StoryAggregate> {
  isSatisfiedBy(candidate: StoryAggregate): boolean {
    return !candidate.profile.isStandalone;
  }
}

export class BranchingSpec extends Specification<StoryAggregate> {
  isSatisfiedBy(candidate: StoryAggregate): boolean {
    return candidate.plot?.plotType === 'branching' || candidate.plot?.plotType === 'openWorld' || candidate.plot?.plotType === 'sandbox';
  }
}

export class LinearSpec extends Specification<StoryAggregate> {
  isSatisfiedBy(candidate: StoryAggregate): boolean {
    return candidate.plot?.plotType === 'linear';
  }
}
