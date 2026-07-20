export { DomainError, AggregateError, BusinessRuleError, SpecificationError, FactoryError } from './errors';

export { Identity } from './identity';
export { Timestamp } from './timestamp';
export { ValueObject } from './value-object';

export { Entity } from './entity';
export { AggregateRoot } from './aggregate-root';

export { SoftDelete, applySoftDelete, applyRestore } from './soft-delete';
export { DomainVersion } from './domain-version';
export { DomainMetadata } from './domain-metadata';
export { DomainSnapshot, SnapshotStore } from './domain-snapshot';

export {
  AuditAction,
  AuditEntry,
  AuditStore,
  AuditTrail,
} from './audit-trail';

export { DomainEvent, DomainEventMetadata, DomainEventProps } from './domain-event';
export { DomainEventDispatcher, IDomainEventHandler } from './domain-event-dispatcher';
export { IDomainEventPublisher, InMemoryDomainEventPublisher } from './domain-event-publisher';

export { DomainContext, DomainContextProps } from './domain-context';

export { Specification, CompositeSpecification } from './specification';

export { BusinessRule, BusinessRuleViolation, Severity } from './business-rule';
export { Invariant } from './invariant';

export { DomainPolicy, PolicyEvaluationResult } from './domain-policy';
export { DomainService } from './domain-service';
export { Factory } from './factory';
export { RepositoryContract } from './repository-contract';

export { UnitOfWork, EntityState, InMemoryUnitOfWork } from './unit-of-work';

export {
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
  DomainKernelOptions,
  DOMAIN_EVENT_PUBLISHER,
  DOMAIN_KERNEL_OPTIONS,
} from './domain.module';
