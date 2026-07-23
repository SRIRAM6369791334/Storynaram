import { Specification } from '@storynaram/domain-kernel';
import { CanonAggregate } from './canon-aggregate.js';

export class CanonicalSpec extends Specification<CanonAggregate> {
  isSatisfiedBy(candidate: CanonAggregate): boolean {
    return candidate.entries.withOpenConflicts().length === 0;
  }
}

export class DeprecatedSpec extends Specification<CanonAggregate> {
  isSatisfiedBy(candidate: CanonAggregate): boolean {
    return candidate.entries.withStatus('deprecated').length > 0;
  }
}

export class ConflictedSpec extends Specification<CanonAggregate> {
  isSatisfiedBy(candidate: CanonAggregate): boolean {
    return candidate.entries.withOpenConflicts().length > 0;
  }
}

export class PublishedSpec extends Specification<CanonAggregate> {
  isSatisfiedBy(candidate: CanonAggregate): boolean {
    return candidate.isPublished;
  }
}

export class DraftSpec extends Specification<CanonAggregate> {
  isSatisfiedBy(candidate: CanonAggregate): boolean {
    return !candidate.isPublished && candidate.entries.withOpenConflicts().length === 0;
  }
}
