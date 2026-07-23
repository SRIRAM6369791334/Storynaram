export { DomainError, AggregateError, BusinessRuleError, SpecificationError, FactoryError } from './errors.js';

export { Identity } from './identity.js';
export { Timestamp } from './timestamp.js';
export { ValueObject } from './value-object.js';

export { Entity } from './entity.js';
export { AggregateRoot } from './aggregate-root.js';

export type { SoftDelete } from './soft-delete.js';
export { applySoftDelete, applyRestore } from './soft-delete.js';
export { DomainVersion } from './domain-version.js';
export { DomainMetadata } from './domain-metadata.js';
export { DomainSnapshot } from './domain-snapshot.js';
export type { SnapshotStore } from './domain-snapshot.js';

export {
  AuditAction,
  AuditEntry,
  AuditTrail,
} from './audit-trail.js';
export type { AuditStore } from './audit-trail.js';

export { DomainEvent } from './domain-event.js';
export type { DomainEventMetadata, DomainEventProps } from './domain-event.js';
export { DomainEventDispatcher } from './domain-event-dispatcher.js';
export type { IDomainEventHandler } from './domain-event-dispatcher.js';
export type { IDomainEventPublisher } from './domain-event-publisher.js';
export { InMemoryDomainEventPublisher } from './domain-event-publisher.js';

export { DomainContext } from './domain-context.js';
export type { DomainContextProps } from './domain-context.js';

export { Specification, CompositeSpecification } from './specification.js';

export { BusinessRule, BusinessRuleViolation, Severity } from './business-rule.js';
export { Invariant } from './invariant.js';

export { DomainPolicy } from './domain-policy.js';
export type { PolicyEvaluationResult } from './domain-policy.js';
export { DomainService } from './domain-service.js';
export { Factory } from './factory.js';
export type { RepositoryContract } from './repository-contract.js';

export type { UnitOfWork } from './unit-of-work.js';
export { EntityState, InMemoryUnitOfWork } from './unit-of-work.js';

export type {
  RepositoryRuntimeContract,
  WorkflowRuntimeContract,
  ValidationRuntimeContract,
  AIRuntimeContract,
  PluginRuntimeContract,
  SearchProviderContract,
  StorageProviderContract,
} from './integration/index.js';

export {
  DomainKernelModule,
  DOMAIN_EVENT_PUBLISHER,
  DOMAIN_KERNEL_OPTIONS,
} from './domain.module.js';
export type { DomainKernelOptions } from './domain.module.js';
