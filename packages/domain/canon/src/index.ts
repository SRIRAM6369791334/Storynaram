export { CanonIdentity } from './canon-identity.js';

export { CanonFact } from './canon-fact.js';
export type { FactType } from './canon-fact.js';

export { CanonReference } from './canon-reference.js';
export type { DomainType } from './canon-reference.js';

export { CanonSource } from './canon-source.js';
export type { SourceType } from './canon-source.js';

export { CanonVersion } from './canon-version.js';

export { CanonConflict } from './canon-conflict.js';
export type { ConflictStatus } from './canon-conflict.js';

export { CanonResolution } from './canon-resolution.js';
export type { ResolutionStrategy } from './canon-resolution.js';

export { CanonEntry } from './canon-entry.js';
export type { EntryStatus } from './canon-entry.js';

export { CanonRule } from './canon-rule.js';
export type { RuleType, RuleSeverity } from './canon-rule.js';

export { CanonCollection } from './canon-collection.js';

export { CanonStatistics } from './canon-statistics.js';
export type { CanonStatisticsProps } from './canon-statistics.js';

export { CanonAggregate } from './canon-aggregate.js';

export {
  CanonFactory,
} from './canon-factory.js';
export type {
  CreateCanonProps,
  CreateCanonEntryInput,
} from './canon-factory.js';

export { CANON_REPOSITORY } from './canon-repository.js';
export type { CanonRepositoryContract } from './canon-repository.js';

export { CanonDomainService } from './canon-domain-service.js';

export {
  CanonicalSpec,
  DeprecatedSpec,
  ConflictedSpec,
  PublishedSpec,
  DraftSpec,
} from './canon-specifications.js';

export {
  CanonCreatedEvent,
  FactAddedEvent,
  FactUpdatedEvent,
  ConflictDetectedEvent,
  ConflictResolvedEvent,
  CanonPublishedEvent,
} from './canon-events.js';

export {
  SingleCanonTruthRule,
  ConflictDetectionRule,
  ReferenceValidationRule,
  assertNoUnresolvedConflicts,
} from './business-rules.js';

export { CanonDomainModule } from './canon.module.js';

export {
  indexCanonForSearch,
  triggerCanonWorkflow,
  handleCanonCreatedIntegration,
  handleConflictDetectedIntegration,
  handleCanonPublishedIntegration,
} from './integration.js';
export type { CanonRuntimeIntegrations } from './integration.js';
