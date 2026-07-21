export { CanonIdentity } from './canon-identity';

export { CanonFact } from './canon-fact';
export type { FactType } from './canon-fact';

export { CanonReference } from './canon-reference';
export type { DomainType } from './canon-reference';

export { CanonSource } from './canon-source';
export type { SourceType } from './canon-source';

export { CanonVersion } from './canon-version';

export { CanonConflict } from './canon-conflict';
export type { ConflictStatus } from './canon-conflict';

export { CanonResolution } from './canon-resolution';
export type { ResolutionStrategy } from './canon-resolution';

export { CanonEntry } from './canon-entry';
export type { EntryStatus } from './canon-entry';

export { CanonRule } from './canon-rule';
export type { RuleType, RuleSeverity } from './canon-rule';

export { CanonCollection } from './canon-collection';

export { CanonStatistics } from './canon-statistics';
export type { CanonStatisticsProps } from './canon-statistics';

export { CanonAggregate } from './canon-aggregate';

export {
  CanonFactory,
} from './canon-factory';
export type {
  CreateCanonProps,
  CreateCanonEntryInput,
} from './canon-factory';

export { CANON_REPOSITORY } from './canon-repository';
export type { CanonRepositoryContract } from './canon-repository';

export { CanonDomainService } from './canon-domain-service';

export {
  CanonicalSpec,
  DeprecatedSpec,
  ConflictedSpec,
  PublishedSpec,
  DraftSpec,
} from './canon-specifications';

export {
  CanonCreatedEvent,
  FactAddedEvent,
  FactUpdatedEvent,
  ConflictDetectedEvent,
  ConflictResolvedEvent,
  CanonPublishedEvent,
} from './canon-events';

export {
  SingleCanonTruthRule,
  ConflictDetectionRule,
  ReferenceValidationRule,
  assertNoUnresolvedConflicts,
} from './business-rules';

export { CanonDomainModule } from './canon.module';

export {
  indexCanonForSearch,
  triggerCanonWorkflow,
  handleCanonCreatedIntegration,
  handleConflictDetectedIntegration,
  handleCanonPublishedIntegration,
} from './integration';
export type { CanonRuntimeIntegrations } from './integration';
