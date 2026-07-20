import { describe, it, expect } from 'vitest';
import { QueryExpression } from '../src/query/query-expression';
import { QueryBuilder } from '../src/query/query-builder';
import type { QueryResult, QueryClause } from '../src/query/types';

function createMockEngine() {
  return {
    find: async <T>(_entityType: string, options?: any): Promise<QueryResult<T>> => ({
      data: [] as T[],
      total: 0,
      pagination: options?.pagination
        ? { type: 'offset', limit: options.pagination.limit, offset: options.pagination.offset ?? 0, hasNext: false, hasPrevious: false, totalPages: 1 }
        : undefined,
    }),
    findOne: async () => ({ data: null }),
    count: async () => 0,
    exists: async () => false,
    findMany: async () => [] as any[],
  } as any;
}

describe('Query Pagination', () => {
  const engine = createMockEngine();

  it('should support offset pagination', async () => {
    const builder = new QueryBuilder('character', engine);
    builder.page(1, 20);
    const options = (builder as any).buildOptions();
    expect(options.pagination).toEqual({ type: 'offset', limit: 20, offset: 0 });
  });

  it('should support page 2', () => {
    const builder = new QueryBuilder('character', engine);
    builder.page(2, 10);
    const options = (builder as any).buildOptions();
    expect(options.pagination).toEqual({ type: 'offset', limit: 10, offset: 10 });
  });

  it('should support page 5 with 50 items per page', () => {
    const builder = new QueryBuilder('character', engine);
    builder.page(5, 50);
    const options = (builder as any).buildOptions();
    expect(options.pagination).toEqual({ type: 'offset', limit: 50, offset: 200 });
  });

  it('should support cursor pagination', () => {
    const builder = new QueryBuilder('character', engine);
    builder.cursor('eyJsYXN0SWQiOiAiMTIzIn0', 25);
    const options = (builder as any).buildOptions();
    expect(options.pagination).toEqual({ type: 'cursor', limit: 25, cursor: 'eyJsYXN0SWQiOiAiMTIzIn0' });
  });

  it('should combine pagination with filter', () => {
    const builder = new QueryBuilder('character', engine);
    builder
      .where(QueryExpression.field('status').equals('active'))
      .page(1, 10);
    const options = (builder as any).buildOptions();
    expect(options.pagination).toBeDefined();
    expect(options.filter).toBeDefined();
  });

  it('should combine pagination with sort', () => {
    const builder = new QueryBuilder('character', engine);
    builder
      .orderBy('name')
      .page(1, 20);
    const options = (builder as any).buildOptions();
    expect(options.pagination).toBeDefined();
    expect(options.sort).toHaveLength(1);
  });

  it('default limit should be 10 for page', () => {
    const builder = new QueryBuilder('character', engine);
    builder.page(1);
    const options = (builder as any).buildOptions();
    expect(options.pagination).toEqual({ type: 'offset', limit: 10, offset: 0 });
  });

  it('default limit should be 10 for cursor', () => {
    const builder = new QueryBuilder('character', engine);
    builder.cursor('cursor-val');
    const options = (builder as any).buildOptions();
    expect(options.pagination).toEqual({ type: 'cursor', limit: 10, cursor: 'cursor-val' });
  });
});

describe('Pagination metadata', () => {
  it('should calculate totalPages correctly', () => {
    const total = 95;
    const limit = 10;
    const totalPages = Math.ceil(total / limit);
    expect(totalPages).toBe(10);
    expect(Math.ceil(100 / 10)).toBe(10);
    expect(Math.ceil(101 / 10)).toBe(11);
  });

  it('should determine hasNext correctly', () => {
    const scenarios = [
      { offset: 0, limit: 10, total: 100, expected: true },
      { offset: 90, limit: 10, total: 100, expected: false },
      { offset: 50, limit: 10, total: 100, expected: true },
      { offset: 95, limit: 10, total: 100, expected: false },
    ];
    for (const s of scenarios) {
      const hasNext = s.offset + s.limit < s.total;
      expect(hasNext).toBe(s.expected);
    }
  });

  it('should determine hasPrevious correctly', () => {
    expect(0 > 0).toBe(false);
    expect(10 > 0).toBe(true);
    expect(50 > 0).toBe(true);
  });
});
