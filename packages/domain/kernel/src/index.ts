export { DomainError, AggregateError, BusinessRuleError, SpecificationError, FactoryError } from './errors';

export { Identity } from './identity';
export { Timestamp } from './timestamp';
export { ValueObject } from './value-object';

export { Entity } from './entity';
export { AggregateRoot } from './aggregate-root';

export type { SoftDelete } from './soft-delete';
export { applySoftDelete, applyRestore } from './soft-delete';
export { DomainVersion } from './domain-version';
export { DomainMetadata } from './domain-metadata';
export { DomainSnapshot } from './domain-snapshot';
export type { SnapshotStore } from './domain-snapshot';

export {
  AuditAction,
  AuditEntry,
  AuditTrail,
} from './audit-trail';
export type { AuditStore } from './audit-trail';

export { DomainEvent } from './domain-event';
export type { DomainEventMetadata, DomainEventProps } from './domain-event';
export { DomainEventDispatcher } from './domain-event-dispatcher';
export type { IDomainEventHandler } from './domain-event-dispatcher';
export type { IDomainEventPublisher } from './domain-event-publisher';
export { InMemoryDomainEventPublisher } from './domain-event-publisher';

export { DomainContext } from './domain-context';
export type { DomainContextProps } from './domain-context';

export { Specification, CompositeSpecification } from './specification';

export { BusinessRule, BusinessRuleViolation, Severity } from './business-rule';
export { Invariant } from './invariant';

export { DomainPolicy } from './domain-policy';
export type { PolicyEvaluationResult } from './domain-policy';
export { DomainService } from './domain-service';
export { Factory } from './factory';
export type { RepositoryContract } from './repository-contract';

export type { UnitOfWork } from './unit-of-work';
export { EntityState, InMemoryUnitOfWork } from './unit-of-work';

export type {
  RepositoryRuntimeContract,
  WorkflowRuntimeContract,
  ValidationRuntimeContract,
  AIRuntimeContract,
  PluginRuntimeContract,
  SearchProviderContract,
  StorageProviderContract,
} from './integration';

export {
  DomainKernelModule,
  DOMAIN_EVENT_PUBLISHER,
  DOMAIN_KERNEL_OPTIONS,
} from './domain.module';
export type { DomainKernelOptions } from './domain.module';
