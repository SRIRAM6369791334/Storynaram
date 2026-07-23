import { Specification } from '@storynaram/domain-kernel';
import { NarrativeAggregate } from './narrative-aggregate.js';

export class PublishedSpec extends Specification<NarrativeAggregate> {
  isSatisfiedBy(candidate: NarrativeAggregate): boolean {
    return candidate.profile.status.isPublished();
  }
}

export class DraftSpec extends Specification<NarrativeAggregate> {
  isSatisfiedBy(candidate: NarrativeAggregate): boolean {
    return candidate.profile.status.isDraft();
  }
}

export class CompletedSpec extends Specification<NarrativeAggregate> {
  isSatisfiedBy(candidate: NarrativeAggregate): boolean {
    return candidate.profile.status.isCompleted();
  }
}

export class InProgressSpec extends Specification<NarrativeAggregate> {
  isSatisfiedBy(candidate: NarrativeAggregate): boolean {
    return !candidate.profile.status.isCompleted() && !candidate.profile.status.isPublished() && !candidate.profile.status.isArchived();
  }
}

export class NovelSpec extends Specification<NarrativeAggregate> {
  isSatisfiedBy(candidate: NarrativeAggregate): boolean {
    return candidate.profile.format === 'novel';
  }
}

export class ComicSpec extends Specification<NarrativeAggregate> {
  isSatisfiedBy(candidate: NarrativeAggregate): boolean {
    return candidate.profile.format === 'comic' || candidate.profile.format === 'manga';
  }
}

export class ScreenplaySpec extends Specification<NarrativeAggregate> {
  isSatisfiedBy(candidate: NarrativeAggregate): boolean {
    return candidate.profile.format === 'screenplay' || candidate.profile.format === 'tvSeries';
  }
}

export class InteractiveSpec extends Specification<NarrativeAggregate> {
  isSatisfiedBy(candidate: NarrativeAggregate): boolean {
    return candidate.profile.format === 'interactiveFiction' || candidate.profile.format === 'visualNovel' || candidate.profile.format === 'rpgCampaign';
  }
}

export class SeriesSpec extends Specification<NarrativeAggregate> {
  isSatisfiedBy(candidate: NarrativeAggregate): boolean {
    return !candidate.metadata.isStandalone;
  }
}

export class StandaloneSpec extends Specification<NarrativeAggregate> {
  isSatisfiedBy(candidate: NarrativeAggregate): boolean {
    return candidate.metadata.isStandalone;
  }
}
