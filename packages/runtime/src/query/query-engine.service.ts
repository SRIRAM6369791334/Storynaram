import { Injectable, Logger } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import { RepositoryRegistry } from '../repository/repository-registry';
import { RelationshipGraph } from '../relationship/relationship-graph';
import { RelationshipTraversalService } from '../relationship/relationship-traversal.service';
import { RelationshipQueryService } from '../relationship/relationship-query.service';
import { EntityCacheService } from '../entity-cache.service';
import { EntityValidationService } from '../entity-validation.service';
import { EntityEventService } from '../entity-event.service';
import { QueryCacheService } from './query-cache.service';
import { QueryStatisticsService } from './query-statistics.service';
import { QueryPlanner } from './query-planner';
import { QueryOptimizer } from './query-optimizer';
import { QueryExecutor } from './query-executor';
import { QueryBuilder } from './query-builder';
import { QueryContext } from './query-context';
import { QueryRegistry } from './query-registry';
import { QueryExpression } from './query-expression';
import type {
  QueryOptions,
  QueryResult,
  SingleQueryResult,
  QueryClause,
  QueryStatistics,
  AggregationPipeline,
  AggregationResult,
  SubgraphResult,
  ComponentResult,
  QueryEngineOptions,
} from './types';
import type { PathResult, CycleResult } from '../relationship/types';

@Injectable()
export class QueryEngineService {
  private readonly logger = new Logger(QueryEngineService.name);

  constructor(
    private readonly repositoryRegistry: RepositoryRegistry,
    private readonly relationshipGraph: RelationshipGraph,
    private readonly relationshipTraversal: RelationshipTraversalService,
    private readonly relationshipQuery: RelationshipQueryService,
    private readonly entityCache: EntityCacheService,
    private readonly entityValidation: EntityValidationService,
    private readonly entityEvents: EntityEventService,
    private readonly queryCache: QueryCacheService,
    private readonly queryStatistics: QueryStatisticsService,
    private readonly planner: QueryPlanner,
    private readonly optimizer: QueryOptimizer,
    private readonly executor: QueryExecutor,
    private readonly context: QueryContext,
    private readonly registry: QueryRegistry,
    private readonly options: QueryEngineOptions,
  ) {}

  async find<T extends Record<string, unknown>>(
    entityType: string,
    options?: QueryOptions,
  ): Promise<QueryResult<T>> {
    const cacheKey = options?.cacheKey;
    if (cacheKey) {
      const cached = this.queryCache.get(this.queryCache.buildKey(entityType, cacheKey)) as QueryResult<T> | undefined;
      if (cached) {
        this.queryStatistics.recordExecution({
          ...cached.statistics!,
          cacheHit: true,
        } as QueryStatistics);
        return cached;
      }
    }

    const plan = this.planner.plan(entityType, options);
    const optimizedPlan = this.optimizer.optimize(plan, options);

    const startTime = Date.now();
    let error = false;
    try {
      const result = await this.executor.execute<T>(entityType, optimizedPlan, options);
      const statistics: QueryStatistics = {
        executionTimeMs: Date.now() - startTime,
        totalRows: result.total,
        cacheHit: false,
        relationshipsTraversed: result.statistics?.relationshipsTraversed ?? 0,
        repositoriesQueried: result.statistics?.repositoriesQueried ?? [],
        planComplexity: optimizedPlan.estimatedComplexity,
        optimizationApplied: [],
      };
      this.queryStatistics.recordExecution(statistics);
      return { ...result, statistics };
    } catch (err) {
      error = true;
      const statistics: QueryStatistics = {
        executionTimeMs: Date.now() - startTime,
        totalRows: 0,
        cacheHit: false,
        relationshipsTraversed: 0,
        repositoriesQueried: [entityType],
        planComplexity: optimizedPlan.estimatedComplexity,
        optimizationApplied: [],
      };
      this.queryStatistics.recordExecution(statistics, error);
      throw err;
    }
  }

  async findOne<T extends Record<string, unknown>>(
    entityType: string,
    options?: QueryOptions,
  ): Promise<SingleQueryResult<T>> {
    const pagination = { type: 'offset' as const, limit: 1, offset: 0 };
    const result = await this.find<T>(entityType, { ...options, pagination });
    return {
      data: (result.data[0] as T | undefined) ?? null,
      statistics: result.statistics,
    };
  }

  async findMany<T extends Record<string, unknown>>(
    entityType: string,
    ids: EntityId[],
  ): Promise<T[]> {
    const items: T[] = [];
    for (const id of ids) {
      const cached = this.entityCache.get<T>(entityType, id);
      if (cached) {
        items.push(cached);
        continue;
      }
    }
    const remaining = ids.filter(id => !items.some(item => (item as unknown as { entityId: EntityId }).entityId === id));
    if (remaining.length > 0) {
      const repo = this.repositoryRegistry.resolve<T & { entityId: EntityId }>(entityType);
      for (const id of remaining) {
        const result = await repo.findById(id);
        if (result.success && result.data) {
          items.push(result.data as T);
          this.entityCache.set(entityType, id, result.data);
        }
      }
    }
    return items;
  }

  async first<T extends Record<string, unknown>>(
    entityType: string,
    options?: QueryOptions,
  ): Promise<T | null> {
    const result = await this.findOne<T>(entityType, options);
    return result.data;
  }

  async last<T extends Record<string, unknown>>(
    entityType: string,
    options?: QueryOptions,
  ): Promise<T | null> {
    const sort = options?.sort ?? [];
    const invertedSort = sort.map(s => ({
      field: s.field,
      direction: s.direction === 'asc' ? 'desc' as const : 'asc' as const,
    }));
    const result = await this.findOne<T>(entityType, { ...options, sort: invertedSort });
    return result.data;
  }

  async exists<T extends Record<string, unknown>>(
    entityType: string,
    filter?: QueryExpression,
  ): Promise<boolean> {
    const filterClause = filter?.toClause();
    const pagination = { type: 'offset' as const, limit: 1, offset: 0 };
    const result = await this.find<T>(entityType, { filter: filterClause, pagination });
    return result.data.length > 0;
  }

  async count<T extends Record<string, unknown>>(
    entityType: string,
    filter?: QueryExpression,
  ): Promise<number> {
    const filterClause = filter?.toClause();
    return this.executor.executeCount<T>(entityType, { filter: filterClause });
  }

  async distinct<T extends Record<string, unknown>>(
    entityType: string,
    field: string,
    filter?: QueryExpression,
  ): Promise<unknown[]> {
    const filterClause = filter?.toClause();
    return this.executor.executeDistinct<T>(entityType, field, { filter: filterClause });
  }

  async aggregate<T extends Record<string, unknown>>(
    entityType: string,
    pipeline: AggregationPipeline,
  ): Promise<AggregationResult[]> {
    return this.executor.executeAggregate<T>(entityType, pipeline);
  }

  async search<T extends Record<string, unknown>>(
    entityType: string,
    query: string,
    fields: string[],
    options?: QueryOptions,
  ): Promise<T[]> {
    if (fields.length === 0) return [];
    const searchConditions = fields.map(field =>
      QueryExpression.field(field).contains(query),
    );
    const searchFilter = QueryExpression.or(...searchConditions);
    const combinedFilter = options?.filter
      ? QueryExpression.raw(options.filter).and(searchFilter).toClause()
      : searchFilter.toClause();

    const result = await this.find<T>(entityType, { ...options, filter: combinedFilter });
    return result.data as T[];
  }

  async stream<T extends Record<string, unknown>>(
    entityType: string,
    filter?: QueryExpression,
  ): Promise<T[]> {
    const filterClause = filter?.toClause();
    const result = await this.find<T>(entityType, { filter: filterClause });
    return result.data as T[];
  }

  async join<T extends Record<string, unknown>>(
    entityType: string,
    relation: string,
    options?: QueryOptions,
  ): Promise<T[]> {
    const includes = [{ relation }];
    const result = await this.find<T>(entityType, { ...options, includes });
    return result.data as T[];
  }

  async include<T extends Record<string, unknown>>(
    entityType: string,
    relations: string[],
    options?: QueryOptions,
  ): Promise<T[]> {
    const includes = relations.map(relation => ({ relation }));
    const result = await this.find<T>(entityType, { ...options, includes });
    return result.data as T[];
  }

  async expand<T extends Record<string, unknown>>(
    entityType: string,
    path: string,
    maxDepth?: number,
    options?: QueryOptions,
  ): Promise<T[]> {
    const expands = [{ path, maxDepth }];
    const result = await this.find<T>(entityType, { ...options, expands });
    return result.data as T[];
  }

  async parents<T = Record<string, unknown>>(entityId: EntityId): Promise<T[]> {
    const edges = this.relationshipTraversal.parents(entityId);
    return this.resolveEdgeTargets<T>(edges.map(e => e.sourceId));
  }

  async children<T = Record<string, unknown>>(entityId: EntityId): Promise<T[]> {
    const edges = this.relationshipTraversal.children(entityId);
    return this.resolveEdgeTargets<T>(edges.map(e => e.targetId));
  }

  async ancestors<T = Record<string, unknown>>(
    entityId: EntityId,
    maxDepth?: number,
  ): Promise<T[]> {
    const result = await this.executor.executeAncestors(entityId, maxDepth);
    const ids = [...new Set(result.flatMap(r => [r.sourceId, r.targetId]))].filter(id => id !== entityId);
    return this.resolveEdgeTargets<T>(ids);
  }

  async descendants<T = Record<string, unknown>>(
    entityId: EntityId,
    maxDepth?: number,
  ): Promise<T[]> {
    const result = await this.executor.executeDescendants(entityId, maxDepth);
    const ids = [...new Set(result.flatMap(r => [r.sourceId, r.targetId]))].filter(id => id !== entityId);
    return this.resolveEdgeTargets<T>(ids);
  }

  async neighbors<T = Record<string, unknown>>(
    entityId: EntityId,
  ): Promise<T[]> {
    const neighborIds = this.relationshipGraph.getNeighbors(entityId);
    return this.resolveEdgeTargets<T>(neighborIds);
  }

  async path(
    from: EntityId,
    to: EntityId,
  ): Promise<{ edges: Array<{ sourceId: EntityId; targetId: EntityId; type: string }>; totalWeight: number; nodeCount: number } | null> {
    return this.executor.executePath(from, to);
  }

  async shortestPath(
    from: EntityId,
    to: EntityId,
  ): Promise<{ edges: Array<{ sourceId: EntityId; targetId: EntityId; type: string }>; totalWeight: number; nodeCount: number } | null> {
    const result = this.relationshipTraversal.shortestPath(from, to);
    if (!result) return null;
    return {
      edges: result.edges.map(e => ({ sourceId: e.sourceId, targetId: e.targetId, type: e.type })),
      totalWeight: result.totalWeight,
      nodeCount: result.nodeCount,
    };
  }

  async reachable(
    startId: EntityId,
    maxDepth?: number,
  ): Promise<EntityId[]> {
    return this.executor.executeReachable(startId, maxDepth);
  }

  async connectedComponents(): Promise<ComponentResult[]> {
    return this.executor.executeConnectedComponents();
  }

  async detectCycles(): Promise<{ hasCycles: boolean; cycles: Array<Array<{ sourceId: EntityId; targetId: EntityId; type: string }>> }> {
    return this.executor.executeCycleDetection();
  }

  async findRoots(): Promise<EntityId[]> {
    return this.executor.executeRoots();
  }

  async findLeaves(): Promise<EntityId[]> {
    return this.executor.executeLeaves();
  }

  async findSubgraph(
    entityIds: EntityId[],
    depth?: number,
  ): Promise<SubgraphResult> {
    return this.executor.executeSubgraph(entityIds, depth);
  }

  createQuery<T extends Record<string, unknown>>(entityType: string): QueryBuilder<T> {
    return new QueryBuilder<T>(entityType, this);
  }

  getRegistry(): QueryRegistry {
    return this.registry;
  }

  getStatistics(): QueryStatisticsService {
    return this.queryStatistics;
  }

  getContext(): QueryContext {
    return this.context;
  }

  private async resolveEdgeTargets<T>(entityIds: EntityId[]): Promise<T[]> {
    const items: T[] = [];
    for (const id of entityIds) {
      const cached = this.entityCache.get<T>('_unknown', id);
      if (cached) {
        items.push(cached);
      }
    }
    return items;
  }
}
