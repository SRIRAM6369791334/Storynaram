import { Injectable } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import { RepositoryRegistry } from '../repository/repository-registry.js';
import type { RepositoryPort } from '../repository/repository-port.js';
import { RelationshipGraph } from '../relationship/relationship-graph.js';
import { RelationshipTraversalService } from '../relationship/relationship-traversal.service.js';
import { RelationshipQueryService } from '../relationship/relationship-query.service.js';
import { EntityCacheService } from '../entity-cache.service.js';
import { EntityValidationService } from '../entity-validation.service.js';
import { EntityEventService } from '../entity-event.service.js';
import { QueryCacheService } from './query-cache.service.js';
import { QueryStatisticsService } from './query-statistics.service.js';
import type { QueryEngineOptions } from './types.js';

@Injectable()
export class QueryContext {
  constructor(
    readonly repositoryRegistry: RepositoryRegistry,
    readonly relationshipGraph: RelationshipGraph,
    readonly relationshipTraversal: RelationshipTraversalService,
    readonly relationshipQuery: RelationshipQueryService,
    readonly entityCache: EntityCacheService,
    readonly entityValidation: EntityValidationService,
    readonly entityEvents: EntityEventService,
    readonly queryCache: QueryCacheService,
    readonly queryStatistics: QueryStatisticsService,
    readonly options: QueryEngineOptions,
  ) {}

  getRepository<T extends { entityId: EntityId }>(entityType: string): RepositoryPort<T> {
    return this.repositoryRegistry.resolve<T>(entityType);
  }

  hasRepository(entityType: string): boolean {
    return this.repositoryRegistry.has(entityType);
  }
}
