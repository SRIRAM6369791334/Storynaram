import { Injectable, Logger } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import { RepositoryRegistry } from '../repository/repository-registry.js';
import { RelationshipGraph } from '../relationship/relationship-graph.js';
import { RelationshipTraversalService } from '../relationship/relationship-traversal.service.js';
import { RelationshipQueryService } from '../relationship/relationship-query.service.js';
import type { RepositoryPort } from '../repository/repository-port.js';
import type { Filter, Sort as RepositorySort } from '../repository/types.js';
import { EntityCacheService } from '../entity-cache.service.js';
import { QueryCacheService } from './query-cache.service.js';
import type {
  QueryOptions,
  QueryPlan,
  QueryClause,
  LogicalGroup,
  FilterOperand,
  QueryResult,
  SingleQueryResult,
  SortField,
  Pagination,
  OffsetPagination,
  CursorPagination,
  Projection,
  IncludeRelation,
  ExpandPath,
  AggregationPipeline,
  AggregationResult,
  SubgraphResult,
  ComponentResult,
  QueryStatistics,
  QueryEngineOptions,
} from './types.js';
import { QueryExecutionError, QueryTimeoutError } from './errors.js';
import type { AggregationOperation } from './types.js';

@Injectable()
export class QueryExecutor {
  private readonly logger = new Logger(QueryExecutor.name);

  constructor(
    private readonly repositoryRegistry: RepositoryRegistry,
    private readonly relationshipGraph: RelationshipGraph,
    private readonly relationshipTraversal: RelationshipTraversalService,
    private readonly relationshipQuery: RelationshipQueryService,
    private readonly entityCache: EntityCacheService,
    private readonly queryCache: QueryCacheService,
    private readonly options: QueryEngineOptions,
  ) {}

  async execute<T extends Record<string, unknown>>(
    entityType: string,
    plan: QueryPlan,
    options?: QueryOptions,
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();
    const timeoutMs = options?.timeoutMs ?? this.options.defaultTimeoutMs ?? 10000;

    const timeout = setTimeout(() => {
      throw new QueryTimeoutError(entityType, timeoutMs);
    }, timeoutMs);

    try {
      const repo = this.repositoryRegistry.resolve<T & { entityId: EntityId }>(entityType);

      let items: T[] = await this.executeScan(repo, options, entityType);

      if (options?.includes && options.includes.length > 0) {
        items = await this.executeIncludes(items, options.includes, entityType);
      }

      if (options?.expands && options.expands.length > 0) {
        items = await this.executeExpands(items, options.expands);
      }

      if (options?.sort && options.sort.length > 0) {
        items = this.executeSort(items, options.sort);
      }

      const total = items.length;

      if (options?.projection) {
        items = this.executeProjection(items, options.projection);
      }

      let paginationResult: QueryResult<T>['pagination'] | undefined;

      if (options?.pagination) {
        const paginated = this.executePagination(items, options.pagination, total);
        items = paginated.items;
        paginationResult = paginated.metadata;
      }

      const executionTimeMs = Date.now() - startTime;
      const statistics: QueryStatistics = {
        executionTimeMs,
        totalRows: items.length,
        cacheHit: false,
        relationshipsTraversed: (options?.includes?.length ?? 0) + (options?.expands?.length ?? 0),
        repositoriesQueried: [entityType],
        planComplexity: plan.estimatedComplexity,
        optimizationApplied: [],
      };

      this.tryCacheResult(options, entityType, {
        data: items,
        total,
        pagination: paginationResult,
        statistics,
      });

      return {
        data: items,
        total,
        pagination: paginationResult,
        statistics,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  async executeSingle<T extends Record<string, unknown>>(
    entityType: string,
    plan: QueryPlan,
    options?: QueryOptions,
  ): Promise<SingleQueryResult<T>> {
    const pagination: OffsetPagination = { type: 'offset', limit: 1, offset: 0 };
    const result = await this.execute<T>(entityType, plan, { ...options, pagination });
    return {
      data: (result.data[0] as T | undefined) ?? null,
      statistics: result.statistics,
    };
  }

  async executeExists<T extends Record<string, unknown>>(
    entityType: string,
    options?: QueryOptions,
  ): Promise<boolean> {
    const pagination: OffsetPagination = { type: 'offset', limit: 1, offset: 0 };
    const result = await this.execute<T>(entityType, { id: '', entityType, steps: [], estimatedComplexity: 1, estimatedRows: 1, cacheable: false, parallelizable: true }, { ...options, pagination });
    return result.data.length > 0;
  }

  async executeCount<T extends Record<string, unknown>>(
    entityType: string,
    options?: QueryOptions,
  ): Promise<number> {
    const repo = this.repositoryRegistry.resolve<T & { entityId: EntityId }>(entityType);
    const filter = options?.filter ? this.clauseToFilter(options.filter) : undefined;
    return repo.count(filter);
  }

  async executeDistinct<T extends Record<string, unknown>>(
    entityType: string,
    field: string,
    options?: QueryOptions,
  ): Promise<unknown[]> {
    const repo = this.repositoryRegistry.resolve<T & { entityId: EntityId }>(entityType);
    const filter = options?.filter ? this.clauseToFilter(options.filter) : undefined;
    const result = await repo.findMany(filter);
    const items = result.data ?? [];
    const values = new Set<unknown>();
    for (const item of items) {
      const value = (item as Record<string, unknown>)[field];
      if (value !== undefined) {
        values.add(value);
      }
    }
    return Array.from(values);
  }

  async executeAggregate<T extends Record<string, unknown>>(
    entityType: string,
    pipeline: AggregationPipeline,
  ): Promise<AggregationResult[]> {
    const repo = this.repositoryRegistry.resolve<T & { entityId: EntityId }>(entityType);
    const filter = pipeline.filter ? this.clauseToFilter(pipeline.filter) : undefined;
    const result = await repo.findMany(filter);
    const items = result.data ?? [];

    if (!pipeline.groupBy || pipeline.groupBy.length === 0) {
      return [this.computeAggregations(items, pipeline.operations)];
    }

    const groups = new Map<string, T[]>();
    for (const item of items) {
      const key = pipeline.groupBy.map(f => String((item as Record<string, unknown>)[f])).join('|');
      const group = groups.get(key);
      if (group) {
        group.push(item);
      } else {
        groups.set(key, [item]);
      }
    }

    const results: AggregationResult[] = [];
    for (const [key, groupItems] of groups) {
      const keyParts = key.split('|');
      const group: Record<string, unknown> = {};
      for (let i = 0; i < pipeline.groupBy.length; i++) {
        group[pipeline.groupBy[i]!] = keyParts[i];
      }
      results.push({
        group,
        values: this.computeAggregations(groupItems, pipeline.operations).values,
      });
    }

    return results;
  }

  async executeRelationshipQuery<T = Record<string, unknown>>(
    entityIds: EntityId[],
    relation: string,
    entityType: string,
  ): Promise<Map<EntityId, T[]>> {
    const result = new Map<EntityId, T[]>();
    for (const entityId of entityIds) {
      const edges = this.relationshipQuery.findRelations({ sourceId: entityId, type: relation as any });
      result.set(entityId, edges as unknown as T[]);
    }
    return result;
  }

  async executeAncestors(
    entityId: EntityId,
    maxDepth?: number,
  ): Promise<Array<{ sourceId: EntityId; targetId: EntityId; type: string }>> {
    const edges = this.relationshipTraversal.ancestors(entityId, maxDepth);
    return edges.flat().map(e => ({
      sourceId: e.sourceId,
      targetId: e.targetId,
      type: e.type,
    }));
  }

  async executeDescendants(
    entityId: EntityId,
    maxDepth?: number,
  ): Promise<Array<{ sourceId: EntityId; targetId: EntityId; type: string }>> {
    const edges = this.relationshipTraversal.descendants(entityId, maxDepth);
    return edges.flat().map(e => ({
      sourceId: e.sourceId,
      targetId: e.targetId,
      type: e.type,
    }));
  }

  async executePath(
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

  async executeReachable(
    startId: EntityId,
    maxDepth?: number,
  ): Promise<EntityId[]> {
    return this.relationshipTraversal.reachableNodes(startId, maxDepth);
  }

  async executeConnectedComponents(): Promise<ComponentResult[]> {
    const stats = this.relationshipGraph.statistics();
    const allNodes = this.relationshipGraph.getAllNodes();
    const visited = new Set<string>();
    const components: ComponentResult[] = [];
    let componentId = 0;

    for (const node of allNodes) {
      if (visited.has(node.entityId)) continue;
      const component: EntityId[] = [];
      const stack: string[] = [node.entityId];
      while (stack.length > 0) {
        const current = stack.pop()!;
        if (visited.has(current)) continue;
        visited.add(current);
        component.push(current as EntityId);
        for (const neighbor of this.relationshipGraph.getNeighbors(current as EntityId)) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        }
      }
      components.push({ id: componentId++, nodes: component, size: component.length });
    }

    return components;
  }

  async executeCycleDetection(): Promise<{ hasCycles: boolean; cycles: Array<Array<{ sourceId: EntityId; targetId: EntityId; type: string }>> }> {
    const result = this.relationshipTraversal.detectCycles();
    return {
      hasCycles: result.hasCycles,
      cycles: (result.cycles ?? []).map(cycle =>
        cycle.map(e => ({ sourceId: e.sourceId, targetId: e.targetId, type: e.type })),
      ),
    };
  }

  async executeRoots(): Promise<EntityId[]> {
    return this.relationshipTraversal.roots();
  }

  async executeLeaves(): Promise<EntityId[]> {
    return this.relationshipTraversal.leaves();
  }

  async executeSubgraph(
    entityIds: EntityId[],
    depth: number = 1,
  ): Promise<SubgraphResult> {
    const visited = new Set<string>();
    const edges: Array<{ source: EntityId; target: EntityId; type: string }> = [];

    const queue = entityIds.map(id => ({ id, currentDepth: 0 }));
    for (const item of queue) {
      visited.add(item.id);
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.currentDepth >= depth) continue;

      const outgoing = this.relationshipGraph.getOutgoingEdges(current.id as EntityId);
      for (const edge of outgoing) {
        edges.push({ source: edge.sourceId, target: edge.targetId, type: edge.type });
        if (!visited.has(edge.targetId)) {
          visited.add(edge.targetId);
          queue.push({ id: edge.targetId, currentDepth: current.currentDepth + 1 });
        }
      }

      const incoming = this.relationshipGraph.getIncomingEdges(current.id as EntityId);
      for (const edge of incoming) {
        edges.push({ source: edge.sourceId, target: edge.targetId, type: edge.type });
        if (!visited.has(edge.sourceId)) {
          visited.add(edge.sourceId);
          queue.push({ id: edge.sourceId, currentDepth: current.currentDepth + 1 });
        }
      }
    }

    return {
      nodes: Array.from(visited).map(id => id as EntityId),
      edges,
      depth,
    };
  }

  private async executeScan<T extends Record<string, unknown>>(
    repo: RepositoryPort<T & { entityId: EntityId }>,
    options?: QueryOptions,
    _entityType?: string,
  ): Promise<T[]> {
    const filter = options?.filter ? this.clauseToFilter(options.filter) : undefined;
    const sort = options?.sort ? this.sortFieldsToRepositorySort(options.sort) : undefined;

    if (options?.pagination && options.pagination.type === 'offset') {
      const offset = options.pagination as OffsetPagination;
      const result = await repo.paginate(
        { page: Math.floor(offset.offset / offset.limit) + 1, limit: offset.limit },
        filter,
        sort,
      );
      return (result.items ?? []) as T[];
    }

    const result = await repo.findMany(filter);
    return (result.data ?? []) as T[];
  }

  private async executeIncludes<T extends Record<string, unknown>>(
    items: T[],
    includes: IncludeRelation[],
    entityType: string,
  ): Promise<T[]> {
    for (const include of includes) {
      const relationType = include.relation as any;
      for (const item of items) {
        const entityId = (item as unknown as { entityId: EntityId }).entityId;
        const edges = this.relationshipQuery.findRelations({
          sourceId: entityId,
          type: relationType,
        });
        const key = include.as ?? include.relation;
        (item as Record<string, unknown>)[key] = edges;
      }
    }
    return items;
  }

  private async executeExpands<T extends Record<string, unknown>>(
    items: T[],
    expands: ExpandPath[],
  ): Promise<T[]> {
    for (const expand of expands) {
      for (const item of items) {
        const entityId = (item as unknown as { entityId: EntityId }).entityId;
        const edges = this.relationshipTraversal.ancestors(entityId, expand.maxDepth);
        const key = expand.as ?? expand.path.replace(/\./g, '_');
        (item as Record<string, unknown>)[key] = edges.flat();
      }
    }
    return items;
  }

  private executeSort<T>(items: T[], sort: SortField[]): T[] {
    if (sort.length === 0) return items;
    const sorted = [...items];
    sorted.sort((a, b) => {
      for (const s of sort) {
        const aVal = (a as Record<string, unknown>)[s.field];
        const bVal = (b as Record<string, unknown>)[s.field];
        if (aVal === undefined && bVal === undefined) continue;
        if (aVal === undefined) return s.direction === 'asc' ? -1 : 1;
        if (bVal === undefined) return s.direction === 'asc' ? 1 : -1;
        let cmp = 0;
        if (aVal == null && bVal == null) continue;
        if (aVal == null) return s.direction === 'asc' ? -1 : 1;
        if (bVal == null) return s.direction === 'asc' ? 1 : -1;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          cmp = aVal.localeCompare(bVal);
        } else {
          cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        }
        if (cmp !== 0) return s.direction === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
    return sorted;
  }

  private executeProjection<T>(
    items: T[],
    projection: Projection,
  ): T[] {
    return items.map(item => {
      let projected = item as Record<string, unknown>;
      if (projection.select && projection.select.length > 0) {
        const selected: Record<string, unknown> = {};
        for (const field of projection.select) {
          if (field in projected) {
            selected[field] = projected[field];
          }
        }
        projected = selected;
      }
      if (projection.exclude && projection.exclude.length > 0) {
        for (const field of projection.exclude) {
          delete projected[field];
        }
      }
      if (projection.computed) {
        for (const [key, fn] of Object.entries(projection.computed)) {
          projected[key] = fn(projected);
        }
      }
      if (projection.mapping) {
        projected = projection.mapping(projected);
      }
      return projected as T;
    });
  }

  private executePagination<T>(
    items: T[],
    pagination: Pagination,
    total: number,
  ): { items: T[]; metadata: QueryResult['pagination'] } {
    if (pagination.type === 'offset') {
      const { offset, limit } = pagination as OffsetPagination;
      const paged = items.slice(offset, offset + limit);
      return {
        items: paged,
        metadata: {
          type: 'offset',
          limit,
          offset,
          hasNext: offset + limit < total,
          hasPrevious: offset > 0,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    const cursor = pagination as CursorPagination;
    const cursorLimit = cursor.limit;
    const sliced = items.slice(0, cursorLimit);
    const lastItem = sliced[sliced.length - 1];
    const firstItem = sliced[0];

    return {
      items: sliced,
      metadata: {
        type: 'cursor',
        limit: cursorLimit,
        cursor: cursor.cursor,
        nextCursor: lastItem ? Buffer.from(JSON.stringify(lastItem)).toString('base64url') : undefined,
        hasNext: items.length > cursorLimit,
        hasPrevious: !!cursor.cursor,
      },
    };
  }

  private clauseToFilter(clause: QueryClause): Filter | undefined {
    if (isEmptyClause(clause)) return undefined;
    const result = convertClause(clause);
    return Object.keys(result).length > 0 ? result : undefined;
  }

  private sortFieldsToRepositorySort(sort: SortField[]): RepositorySort<any>[] {
    return sort.map(s => ({
      field: s.field,
      direction: s.direction,
    }));
  }

  private computeAggregations(
    items: Record<string, unknown>[],
    operations: AggregationOperation[],
  ): AggregationResult {
    const values: Record<string, number> = {};
    for (const op of operations) {
      switch (op.type) {
        case 'count':
          values[op.as] = items.length;
          break;
        case 'sum':
          values[op.as] = items.reduce(
            (sum, item) => sum + (typeof item[op.field!] === 'number' ? (item[op.field!] as number) : 0),
            0,
          );
          break;
        case 'avg':
          values[op.as] = items.length > 0
            ? items.reduce(
                (sum, item) => sum + (typeof item[op.field!] === 'number' ? (item[op.field!] as number) : 0),
                0,
              ) / items.length
            : 0;
          break;
        case 'min':
          values[op.as] = items.length > 0
            ? Math.min(
                ...items.map(item => (typeof item[op.field!] === 'number' ? (item[op.field!] as number) : Infinity)),
              )
            : 0;
          break;
        case 'max':
          values[op.as] = items.length > 0
            ? Math.max(
                ...items.map(item => (typeof item[op.field!] === 'number' ? (item[op.field!] as number) : -Infinity)),
              )
            : 0;
          break;
        case 'distinct':
          values[op.as] = new Set(items.map(item => item[op.field!])).size;
          break;
      }
    }
    return { values };
  }

  private tryCacheResult(
    options: QueryOptions | undefined,
    entityType: string,
    result: QueryResult,
  ): void {
    if (!options?.cacheKey) return;
    const key = this.queryCache.buildKey(entityType, options.cacheKey);
    this.queryCache.set(key, result, options.cacheTtlMs);
  }
}

function isEmptyClause(clause: QueryClause): boolean {
  if (isLogicalGroup(clause)) {
    return clause.conditions.length === 0;
  }
  return false;
}

function isLogicalGroup(clause: QueryClause): clause is LogicalGroup {
  return 'operator' in clause && 'conditions' in clause;
}

function convertClause(clause: QueryClause): Record<string, unknown> {
  if (isLogicalGroup(clause)) {
    if (clause.conditions.length === 0) return {};
    if (clause.conditions.length === 1) {
      return convertClause(clause.conditions[0]!);
    }
    return {
      [clause.operator]: clause.conditions.map(c => convertClause(c)),
    };
  }
  const op = clause as FilterOperand;
  if (op.field === '__not__') {
    return { not: convertClause(op.value as QueryClause) };
  }
  const operatorMap: Record<string, string> = {
    eq: 'eq',
    ne: 'neq',
    gt: 'gt',
    gte: 'gte',
    lt: 'lt',
    lte: 'lte',
    between: 'between',
    contains: 'contains',
    startsWith: 'startsWith',
    endsWith: 'endsWith',
    in: 'in',
    notIn: 'nin',
    isNull: 'isNull',
    isNotNull: 'isNotNull',
  };
  return {
    conditions: [
      {
        field: op.field,
        operator: operatorMap[op.operator] ?? op.operator,
        value: op.value,
      },
    ],
  };
}
