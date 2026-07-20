import { describe, it, expect } from 'vitest';
import { QueryExpression, QueryBuilder, QueryEngineService } from '../src/query';
import type { QueryResult, QueryEngineOptions } from '../src/query/types';

function createMockEngine(): QueryEngineService {
  return {
    find: async <T>(_entityType: string, _options?: any): Promise<QueryResult<T>> => ({
      data: [] as T[],
      total: 0,
    }),
    findOne: async <T>(_entityType: string, _options?: any) => ({ data: null as T | null }),
    count: async <T>(_entityType: string, _filter?: any) => 0,
    exists: async <T>(_entityType: string, _filter?: any) => false,
  } as any;
}

describe('QueryBuilder', () => {
  const engine = createMockEngine();

  it('should build query with where clause', () => {
    const builder = new QueryBuilder('character', engine);
    builder.where(QueryExpression.field('name').equals('Alice'));
    const options = (builder as any).buildOptions();
    expect(options.filter).toBeDefined();
  });

  it('should build query with orderBy', () => {
    const builder = new QueryBuilder('character', engine);
    builder.orderBy('name', 'asc');
    const options = (builder as any).buildOptions();
    expect(options.sort).toEqual([{ field: 'name', direction: 'asc' }]);
  });

  it('should build query with multiple orderBy', () => {
    const builder = new QueryBuilder('character', engine);
    builder.orderBy('name').orderByDesc('age');
    const options = (builder as any).buildOptions();
    expect(options.sort).toHaveLength(2);
    expect(options.sort![0]).toEqual({ field: 'name', direction: 'asc' });
    expect(options.sort![1]).toEqual({ field: 'age', direction: 'desc' });
  });

  it('should build query with limit', () => {
    const builder = new QueryBuilder('character', engine);
    builder.limit(10);
    const options = (builder as any).buildOptions();
    expect(options.pagination).toEqual({ type: 'offset', limit: 10, offset: 0 });
  });

  it('should build query with offset', () => {
    const builder = new QueryBuilder('character', engine);
    builder.limit(10).offset(20);
    const options = (builder as any).buildOptions();
    expect(options.pagination).toEqual({ type: 'offset', limit: 10, offset: 20 });
  });

  it('should build query with page', () => {
    const builder = new QueryBuilder('character', engine);
    builder.page(3, 20);
    const options = (builder as any).buildOptions();
    expect(options.pagination).toEqual({ type: 'offset', limit: 20, offset: 40 });
  });

  it('should build query with cursor', () => {
    const builder = new QueryBuilder('character', engine);
    builder.cursor('abc123', 15);
    const options = (builder as any).buildOptions();
    expect(options.pagination).toEqual({ type: 'cursor', limit: 15, cursor: 'abc123' });
  });

  it('should build query with select projection', () => {
    const builder = new QueryBuilder('character', engine);
    builder.select('id', 'name', 'age');
    const options = (builder as any).buildOptions();
    expect(options.projection?.select).toEqual(['id', 'name', 'age']);
  });

  it('should build query with exclude projection', () => {
    const builder = new QueryBuilder('character', engine);
    builder.exclude('password', 'secret');
    const options = (builder as any).buildOptions();
    expect(options.projection?.exclude).toEqual(['password', 'secret']);
  });

  it('should build query with computed field', () => {
    const builder = new QueryBuilder('character', engine);
    builder.withComputed('fullName', (item) => `${String(item.firstName)} ${String(item.lastName)}`);
    const options = (builder as any).buildOptions();
    expect(options.projection?.computed).toBeDefined();
    expect(options.projection!.computed!.fullName).toBeDefined();
  });

  it('should build query with include', () => {
    const builder = new QueryBuilder('character', engine);
    builder.include('owns', 'inventory');
    const options = (builder as any).buildOptions();
    expect(options.includes).toHaveLength(1);
    expect(options.includes![0]).toEqual({ relation: 'owns', as: 'inventory' });
  });

  it('should build query with expand', () => {
    const builder = new QueryBuilder('character', engine);
    builder.expand('location', 3);
    const options = (builder as any).buildOptions();
    expect(options.expands).toHaveLength(1);
    expect(options.expands![0]).toEqual({ path: 'location', maxDepth: 3 });
  });

  it('should build query with cache', () => {
    const builder = new QueryBuilder('character', engine);
    builder.cache('my-query', 60000);
    const options = (builder as any).buildOptions();
    expect(options.cacheKey).toBe('my-query');
    expect(options.cacheTtlMs).toBe(60000);
  });

  it('should build query with timeout', () => {
    const builder = new QueryBuilder('character', engine);
    builder.timeout(5000);
    const options = (builder as any).buildOptions();
    expect(options.timeoutMs).toBe(5000);
  });

  it('should chain whereField builder', () => {
    const builder = new QueryBuilder('character', engine);
    builder.whereField('age').greaterThan(18);
    const options = (builder as any).buildOptions();
    expect(options.filter).toBeDefined();
  });

  it('should chain andWhere', () => {
    const builder = new QueryBuilder('character', engine);
    builder
      .where(QueryExpression.field('name').equals('Alice'))
      .andWhere(QueryExpression.field('age').greaterThan(18));
    const options = (builder as any).buildOptions();
    expect(options.filter).toBeDefined();
  });

  it('should chain orWhere', () => {
    const builder = new QueryBuilder('character', engine);
    builder
      .where(QueryExpression.field('name').equals('Alice'))
      .orWhere(QueryExpression.field('name').equals('Bob'));
    const options = (builder as any).buildOptions();
    expect(options.filter).toBeDefined();
  });
});

describe('QueryExpression', () => {
  it('should create equals expression', () => {
    const expr = QueryExpression.field('name').equals('Alice');
    const clause = expr.toClause();
    expect(clause).toEqual({ field: 'name', operator: 'eq', value: 'Alice' });
  });

  it('should create not equals expression', () => {
    const expr = QueryExpression.field('status').notEquals('deleted');
    const clause = expr.toClause();
    expect(clause).toEqual({ field: 'status', operator: 'ne', value: 'deleted' });
  });

  it('should create greater than expression', () => {
    const expr = QueryExpression.field('age').greaterThan(18);
    const clause = expr.toClause();
    expect(clause).toEqual({ field: 'age', operator: 'gt', value: 18 });
  });

  it('should create less than expression', () => {
    const expr = QueryExpression.field('age').lessThan(65);
    const clause = expr.toClause();
    expect(clause).toEqual({ field: 'age', operator: 'lt', value: 65 });
  });

  it('should create between expression', () => {
    const expr = QueryExpression.field('age').between(18, 65);
    const clause = expr.toClause();
    expect(clause).toEqual({ field: 'age', operator: 'between', value: [18, 65] });
  });

  it('should create contains expression', () => {
    const expr = QueryExpression.field('title').contains('story');
    const clause = expr.toClause();
    expect(clause).toEqual({ field: 'title', operator: 'contains', value: 'story' });
  });

  it('should create startsWith expression', () => {
    const expr = QueryExpression.field('code').startsWith('ABC');
    const clause = expr.toClause();
    expect(clause).toEqual({ field: 'code', operator: 'startsWith', value: 'ABC' });
  });

  it('should create endsWith expression', () => {
    const expr = QueryExpression.field('email').endsWith('@example.com');
    const clause = expr.toClause();
    expect(clause).toEqual({ field: 'email', operator: 'endsWith', value: '@example.com' });
  });

  it('should create in expression', () => {
    const expr = QueryExpression.field('role').in(['admin', 'user']);
    const clause = expr.toClause();
    expect(clause).toEqual({ field: 'role', operator: 'in', value: ['admin', 'user'] });
  });

  it('should create notIn expression', () => {
    const expr = QueryExpression.field('status').notIn(['deleted', 'archived']);
    const clause = expr.toClause();
    expect(clause).toEqual({ field: 'status', operator: 'notIn', value: ['deleted', 'archived'] });
  });

  it('should create isNull expression', () => {
    const expr = QueryExpression.field('deletedAt').isNull();
    const clause = expr.toClause();
    expect(clause).toEqual({ field: 'deletedAt', operator: 'isNull', value: null });
  });

  it('should create isNotNull expression', () => {
    const expr = QueryExpression.field('email').isNotNull();
    const clause = expr.toClause();
    expect(clause).toEqual({ field: 'email', operator: 'isNotNull', value: null });
  });

  it('should combine with and', () => {
    const expr = QueryExpression.and(
      QueryExpression.field('name').equals('Alice'),
      QueryExpression.field('age').greaterThan(18),
    );
    const clause = expr.toClause();
    expect(clause).toHaveProperty('operator', 'and');
    expect((clause as any).conditions).toHaveLength(2);
  });

  it('should combine with or', () => {
    const expr = QueryExpression.or(
      QueryExpression.field('role').equals('admin'),
      QueryExpression.field('role').equals('moderator'),
    );
    const clause = expr.toClause();
    expect(clause).toHaveProperty('operator', 'or');
    expect((clause as any).conditions).toHaveLength(2);
  });

  it('should negate expression', () => {
    const expr = QueryExpression.not(QueryExpression.field('status').equals('deleted'));
    const clause = expr.toClause();
    expect(clause).toHaveProperty('operator', 'and');
  });

  it('should detect empty expression', () => {
    const expr = QueryExpression.empty();
    expect(expr.isEmpty()).toBe(true);
  });

  it('should convert to filter', () => {
    const expr = QueryExpression.field('name').equals('Alice');
    const filter = expr.toFilter();
    expect(filter).toEqual({ name: { eq: 'Alice' } });
  });

  it('should chain and on instance', () => {
    const expr1 = QueryExpression.field('name').equals('Alice');
    const expr2 = QueryExpression.field('age').greaterThan(18);
    const combined = expr1.and(expr2);
    const clause = combined.toClause();
    expect(clause).toHaveProperty('operator', 'and');
  });

  it('should chain or on instance', () => {
    const expr1 = QueryExpression.field('role').equals('admin');
    const expr2 = QueryExpression.field('role').equals('user');
    const combined = expr1.or(expr2);
    const clause = combined.toClause();
    expect(clause).toHaveProperty('operator', 'or');
  });

  it('should chain not on instance', () => {
    const expr = QueryExpression.field('status').equals('deleted').not();
    const clause = expr.toClause();
    expect(clause).toHaveProperty('operator', 'and');
  });
});
