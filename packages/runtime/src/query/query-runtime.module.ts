import { DynamicModule, Module, Global } from '@nestjs/common';
import { RepositoryRegistry } from '../repository/repository-registry';
import { RelationshipGraph } from '../relationship/relationship-graph';
import { RelationshipTraversalService } from '../relationship/relationship-traversal.service';
import { RelationshipQueryService } from '../relationship/relationship-query.service';
import { EntityCacheService } from '../entity-cache.service';
import { EntityValidationService } from '../entity-validation.service';
import { EntityEventService } from '../entity-event.service';
import { RuntimeConfig } from '../runtime-config';
import { QueryEngineService } from './query-engine.service';
import { QueryPlanner } from './query-planner';
import { QueryOptimizer } from './query-optimizer';
import { QueryExecutor } from './query-executor';
import { QueryCacheService } from './query-cache.service';
import { QueryStatisticsService } from './query-statistics.service';
import { QueryContext } from './query-context';
import { QueryRegistry } from './query-registry';
import type { QueryEngineOptions } from './types';
import { QUERY_ENGINE_OPTIONS } from './tokens';

const DEFAULT_OPTIONS: QueryEngineOptions = {
  defaultTimeoutMs: 10000,
  maxLimit: 1000,
  defaultLimit: 50,
  enableCache: true,
  enableOptimization: true,
  enableStatistics: true,
  cacheTtlMs: 30000,
  maxQueryDepth: 5,
};

@Global()
@Module({})
export class QueryRuntimeModule {
  static forRoot(options?: QueryEngineOptions): DynamicModule {
    const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };
    return {
      module: QueryRuntimeModule,
      global: true,
      providers: [
        { provide: QUERY_ENGINE_OPTIONS, useValue: resolvedOptions },
        {
          provide: QueryCacheService,
          useFactory: (opts: QueryEngineOptions) => new QueryCacheService(opts),
          inject: [QUERY_ENGINE_OPTIONS],
        },
        QueryStatisticsService,
        {
          provide: QueryPlanner,
          useFactory: (opts: QueryEngineOptions) => new QueryPlanner(opts),
          inject: [QUERY_ENGINE_OPTIONS],
        },
        {
          provide: QueryOptimizer,
          useFactory: (opts: QueryEngineOptions) => new QueryOptimizer(opts),
          inject: [QUERY_ENGINE_OPTIONS],
        },
        {
          provide: QueryExecutor,
          useFactory: (
            repoRegistry: RepositoryRegistry,
            graph: RelationshipGraph,
            traversal: RelationshipTraversalService,
            query: RelationshipQueryService,
            cache: EntityCacheService,
            queryCache: QueryCacheService,
            opts: QueryEngineOptions,
          ) => new QueryExecutor(repoRegistry, graph, traversal, query, cache, queryCache, opts),
          inject: [
            RepositoryRegistry,
            RelationshipGraph,
            RelationshipTraversalService,
            RelationshipQueryService,
            EntityCacheService,
            QueryCacheService,
            QUERY_ENGINE_OPTIONS,
          ],
        },
        {
          provide: QueryContext,
          useFactory: (
            repoRegistry: RepositoryRegistry,
            graph: RelationshipGraph,
            traversal: RelationshipTraversalService,
            query: RelationshipQueryService,
            cache: EntityCacheService,
            validation: EntityValidationService,
            events: EntityEventService,
            queryCache: QueryCacheService,
            stats: QueryStatisticsService,
            opts: QueryEngineOptions,
          ) => new QueryContext(repoRegistry, graph, traversal, query, cache, validation, events, queryCache, stats, opts),
          inject: [
            RepositoryRegistry,
            RelationshipGraph,
            RelationshipTraversalService,
            RelationshipQueryService,
            EntityCacheService,
            EntityValidationService,
            EntityEventService,
            QueryCacheService,
            QueryStatisticsService,
            QUERY_ENGINE_OPTIONS,
          ],
        },
        QueryRegistry,
        {
          provide: QueryEngineService,
          useFactory: (
            repoRegistry: RepositoryRegistry,
            graph: RelationshipGraph,
            traversal: RelationshipTraversalService,
            query: RelationshipQueryService,
            cache: EntityCacheService,
            validation: EntityValidationService,
            events: EntityEventService,
            queryCache: QueryCacheService,
            stats: QueryStatisticsService,
            planner: QueryPlanner,
            optimizer: QueryOptimizer,
            executor: QueryExecutor,
            context: QueryContext,
            registry: QueryRegistry,
            opts: QueryEngineOptions,
          ) => new QueryEngineService(
            repoRegistry, graph, traversal, query, cache, validation, events,
            queryCache, stats, planner, optimizer, executor, context, registry, opts,
          ),
          inject: [
            RepositoryRegistry,
            RelationshipGraph,
            RelationshipTraversalService,
            RelationshipQueryService,
            EntityCacheService,
            EntityValidationService,
            EntityEventService,
            QueryCacheService,
            QueryStatisticsService,
            QueryPlanner,
            QueryOptimizer,
            QueryExecutor,
            QueryContext,
            QueryRegistry,
            QUERY_ENGINE_OPTIONS,
          ],
        },
      ],
      exports: [
        QueryEngineService,
        QueryPlanner,
        QueryOptimizer,
        QueryExecutor,
        QueryCacheService,
        QueryStatisticsService,
        QueryContext,
        QueryRegistry,
      ],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: QueryRuntimeModule,
      providers: [
        QueryEngineService,
        QueryPlanner,
        QueryOptimizer,
        QueryExecutor,
        QueryCacheService,
        QueryStatisticsService,
        QueryContext,
        QueryRegistry,
      ],
      exports: [
        QueryEngineService,
        QueryPlanner,
        QueryOptimizer,
        QueryExecutor,
        QueryCacheService,
        QueryStatisticsService,
        QueryContext,
        QueryRegistry,
      ],
    };
  }
}
