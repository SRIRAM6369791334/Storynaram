import { IntegrationRegistry, DomainType } from '../integration-registry.js';
import { CrossDomainValidator } from './cross-domain-validator.js';
import { CrossDomainReferenceResolver, ReferenceDescriptor } from './cross-domain-reference-resolver.js';
import { DomainEventRouter } from './domain-event-router.js';
import { ConsistencyValidator } from './consistency-validator.js';

export interface CrossDomainLink {
  sourceDomain: DomainType;
  sourceId: string;
  sourceType: string;
  targetDomain: DomainType;
  targetId: string;
  targetType: string;
  relationship: string;
}

export interface DomainsSummary {
  registered: DomainType[];
  eventRoutes: number;
  validationRules: number;
  consistencyChecks: number;
  resolvers: number;
  domainLinks: number;
}

export class CrossDomainIntegrationService {
  constructor(
    private readonly registry: IntegrationRegistry,
    private readonly validator: CrossDomainValidator,
    private readonly referenceResolver: CrossDomainReferenceResolver,
    private readonly eventRouter: DomainEventRouter,
    private readonly consistencyValidator: ConsistencyValidator,
  ) {}

  getValidator(): CrossDomainValidator {
    return this.validator;
  }

  getReferenceResolver(): CrossDomainReferenceResolver {
    return this.referenceResolver;
  }

  getEventRouter(): DomainEventRouter {
    return this.eventRouter;
  }

  getConsistencyValidator(): ConsistencyValidator {
    return this.consistencyValidator;
  }

  getRegistry(): IntegrationRegistry {
    return this.registry;
  }

  getSummary(): DomainsSummary {
    return {
      registered: this.registry.getAll().map(r => r.domain),
      eventRoutes: this.eventRouter.getRegisteredEventTypes().length,
      validationRules: this.validator.getRuleCount(),
      consistencyChecks: this.consistencyValidator.getCheckCount(),
      resolvers: this.referenceResolver.getRegisteredResolvers().length,
      domainLinks: 0,
    };
  }
}
