import type { EntityId } from '@storynaram/core';
import type { Filter } from '../repository/types.js';

export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'in'
  | 'notIn'
  | 'isNull'
  | 'isNotNull';

export type LogicalOperator = 'and' | 'or';

export interface FilterOperand {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export interface LogicalGroup {
  operator: LogicalOperator;
  conditions: QueryClause[];
}

export type QueryClause = FilterOperand | LogicalGroup;

export interface SortField {
  field: string;
  direction: 'asc' | 'desc';
}

export interface OffsetPagination {
  type: 'offset';
  limit: number;
  offset: number;
}

export interface CursorPagination {
  type: 'cursor';
  limit: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
}

export type Pagination = OffsetPagination | CursorPagination;

export interface Projection {
  select?: string[];
  exclude?: string[];
  computed?: Record<string, (item: Record<string, unknown>) => unknown>;
  mapping?: (item: Record<string, unknown>) => Record<string, unknown>;
  dtoType?: string;
}

export interface IncludeRelation {
  relation: string;
  as?: string;
  filter?: QueryClause;
  sort?: SortField[];
  limit?: number;
  expand?: string[];
}

export interface ExpandPath {
  path: string;
  as?: string;
  maxDepth?: number;
}

export interface QueryOptions {
  filter?: QueryClause;
  sort?: SortField[];
  pagination?: Pagination;
  projection?: Projection;
  includes?: IncludeRelation[];
  expands?: ExpandPath[];
  timeoutMs?: number;
  cacheKey?: string;
  cacheTtlMs?: number;
}

export interface QueryResult<T = Record<string, unknown>> {
  data: T[];
  total: number;
  pagination?: {
    type: 'offset' | 'cursor';
    limit: number;
    offset?: number;
    cursor?: string;
    nextCursor?: string;
    hasNext: boolean;
    hasPrevious: boolean;
    totalPages?: number;
  };
  statistics?: QueryStatistics;
  metadata?: Record<string, unknown>;
}

export interface SingleQueryResult<T = Record<string, unknown>> {
  data: T | null;
  statistics?: QueryStatistics;
}

export interface QueryStatistics {
  executionTimeMs: number;
  totalRows: number;
  cacheHit: boolean;
  relationshipsTraversed: number;
  repositoriesQueried: string[];
  planComplexity: number;
  optimizationApplied: string[];
}

export interface QueryPlan {
  id: string;
  entityType: string;
  steps: QueryStep[];
  estimatedComplexity: number;
  estimatedRows: number;
  cacheable: boolean;
  parallelizable: boolean;
}

export interface QueryStep {
  type: 'repository_scan' | 'repository_lookup' | 'relationship_traverse' | 'filter' | 'sort' | 'paginate' | 'project' | 'aggregate' | 'join' | 'expand';
  target?: string;
  cost: number;
  description: string;
  detail?: Record<string, unknown>;
}

export interface AggregationPipeline {
  groupBy?: string[];
  operations: AggregationOperation[];
  filter?: QueryClause;
  having?: QueryClause;
}

export interface AggregationOperation {
  type: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct';
  field?: string;
  as: string;
}

export interface AggregationResult {
  group?: Record<string, unknown>;
  values: Record<string, number>;
}

export interface SubgraphResult {
  nodes: EntityId[];
  edges: Array<{ source: EntityId; target: EntityId; type: string }>;
  depth: number;
}

export interface ComponentResult {
  id: number;
  nodes: EntityId[];
  size: number;
}

export interface QueryEngineOptions {
  defaultTimeoutMs?: number;
  maxLimit?: number;
  defaultLimit?: number;
  enableCache?: boolean;
  enableOptimization?: boolean;
  enableStatistics?: boolean;
  cacheTtlMs?: number;
  maxQueryDepth?: number;
}

export interface NamedQuery {
  name: string;
  entityType: string;
  options: QueryOptions;
  description?: string;
}
