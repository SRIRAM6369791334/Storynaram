import type { EntityId } from '@storynaram/core';
import { QueryEngineService } from './query-engine.service';
import { QueryExpression } from './query-expression';
import type {
  QueryOptions,
  QueryResult,
  SingleQueryResult,
  SortField,
  Pagination,
  OffsetPagination,
  CursorPagination,
  Projection,
  IncludeRelation,
  ExpandPath,
  QueryClause,
} from './types';

export class QueryBuilder<T extends Record<string, unknown> = Record<string, unknown>> {
  private filter?: QueryClause;
  private sort: SortField[] = [];
  private pagination?: Pagination;
  private projection?: Projection;
  private includes: IncludeRelation[] = [];
  private expands: ExpandPath[] = [];
  private timeoutMs?: number;
  private cacheKey?: string;
  private cacheTtlMs?: number;

  constructor(
    private readonly entityType: string,
    private readonly engine: QueryEngineService,
  ) {}

  where(expression: QueryExpression): this {
    this.filter = expression.toClause();
    return this;
  }

  whereField(field: string): FieldQueryBuilder<T> {
    return new FieldQueryBuilder<T>(this, field);
  }

  andWhere(expression: QueryExpression): this {
    if (!this.filter) {
      return this.where(expression);
    }
    const current = QueryExpression.raw(this.filter);
    this.filter = current.and(expression).toClause();
    return this;
  }

  orWhere(expression: QueryExpression): this {
    if (!this.filter) {
      return this.where(expression);
    }
    const current = QueryExpression.raw(this.filter);
    this.filter = current.or(expression).toClause();
    return this;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.sort.push({ field, direction });
    return this;
  }

  orderByDesc(field: string): this {
    this.sort.push({ field, direction: 'desc' });
    return this;
  }

  limit(count: number): this {
    this.pagination = {
      type: 'offset',
      limit: count,
      offset: 0,
    };
    return this;
  }

  offset(count: number): this {
    if (this.pagination?.type === 'offset') {
      (this.pagination as OffsetPagination).offset = count;
    } else {
      this.pagination = { type: 'offset', limit: 10, offset: count };
    }
    return this;
  }

  page(pageNum: number, pageSize: number = 10): this {
    this.pagination = {
      type: 'offset',
      limit: pageSize,
      offset: (pageNum - 1) * pageSize,
    };
    return this;
  }

  cursor(cursorValue: string, limitCount: number = 10): this {
    this.pagination = {
      type: 'cursor',
      limit: limitCount,
      cursor: cursorValue,
    };
    return this;
  }

  select(...fields: string[]): this {
    if (!this.projection) {
      this.projection = {};
    }
    this.projection.select = fields;
    return this;
  }

  exclude(...fields: string[]): this {
    if (!this.projection) {
      this.projection = {};
    }
    this.projection.exclude = fields;
    return this;
  }

  withComputed(name: string, fn: (item: Record<string, unknown>) => unknown): this {
    if (!this.projection) {
      this.projection = {};
    }
    if (!this.projection.computed) {
      this.projection.computed = {};
    }
    this.projection.computed[name] = fn;
    return this;
  }

  withMapping(fn: (item: Record<string, unknown>) => Record<string, unknown>): this {
    if (!this.projection) {
      this.projection = {};
    }
    this.projection.mapping = fn;
    return this;
  }

  include(relation: string, as?: string): this {
    this.includes.push({ relation, as });
    return this;
  }

  expand(path: string, maxDepth?: number): this {
    this.expands.push({ path, maxDepth });
    return this;
  }

  timeout(ms: number): this {
    this.timeoutMs = ms;
    return this;
  }

  cache(key: string, ttlMs?: number): this {
    this.cacheKey = key;
    this.cacheTtlMs = ttlMs;
    return this;
  }

  async get(): Promise<T[]> {
    const result = await this.execute();
    return result.data as T[];
  }

  async first(): Promise<T | null> {
    const result = await this.engine.findOne<T>(this.entityType, this.buildOptions());
    return result.data;
  }

  async single(): Promise<T | null> {
    return this.first();
  }

  async count(): Promise<number> {
    return this.engine.count<T>(this.entityType, this.filter ? QueryExpression.raw(this.filter) : undefined);
  }

  async exists(): Promise<boolean> {
    return this.engine.exists<T>(this.entityType, this.filter ? QueryExpression.raw(this.filter) : undefined);
  }

  async paginate(): Promise<QueryResult<T>> {
    return this.execute();
  }

  private async execute(): Promise<QueryResult<T>> {
    return this.engine.find<T>(this.entityType, this.buildOptions());
  }

  private buildOptions(): QueryOptions {
    return {
      filter: this.filter,
      sort: this.sort.length > 0 ? this.sort : undefined,
      pagination: this.pagination,
      projection: this.projection ? { ...this.projection } : undefined,
      includes: this.includes.length > 0 ? [...this.includes] : undefined,
      expands: this.expands.length > 0 ? [...this.expands] : undefined,
      timeoutMs: this.timeoutMs,
      cacheKey: this.cacheKey,
      cacheTtlMs: this.cacheTtlMs,
    };
  }
}

export class FieldQueryBuilder<T extends Record<string, unknown>> {
  constructor(
    private readonly parent: QueryBuilder<T>,
    private readonly field: string,
  ) {}

  equals(value: unknown): QueryBuilder<T> {
    return this.parent.andWhere(QueryExpression.field(this.field).equals(value));
  }

  notEquals(value: unknown): QueryBuilder<T> {
    return this.parent.andWhere(QueryExpression.field(this.field).notEquals(value));
  }

  greaterThan(value: number): QueryBuilder<T> {
    return this.parent.andWhere(QueryExpression.field(this.field).greaterThan(value));
  }

  lessThan(value: number): QueryBuilder<T> {
    return this.parent.andWhere(QueryExpression.field(this.field).lessThan(value));
  }

  contains(value: string): QueryBuilder<T> {
    return this.parent.andWhere(QueryExpression.field(this.field).contains(value));
  }

  startsWith(value: string): QueryBuilder<T> {
    return this.parent.andWhere(QueryExpression.field(this.field).startsWith(value));
  }

  endsWith(value: string): QueryBuilder<T> {
    return this.parent.andWhere(QueryExpression.field(this.field).endsWith(value));
  }

  in(values: unknown[]): QueryBuilder<T> {
    return this.parent.andWhere(QueryExpression.field(this.field).in(values));
  }

  isNull(): QueryBuilder<T> {
    return this.parent.andWhere(QueryExpression.field(this.field).isNull());
  }

  isNotNull(): QueryBuilder<T> {
    return this.parent.andWhere(QueryExpression.field(this.field).isNotNull());
  }
}
