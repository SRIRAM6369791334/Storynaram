import { describe, it, expect } from 'vitest';
import { QueryCompiler } from '../src/query/query-compiler';
import type { Filter } from '@storynaram/runtime';

interface TestEntity { entityId: string; name: string; age: number }

describe('QueryCompiler', () => {
  const compiler = new QueryCompiler();

  it('returns empty when no filter', () => {
    const r = compiler.compileWhere(undefined);
    expect(r.sql).toBe('');
    expect(r.params).toEqual([]);
  });

  it('compiles eq', () => {
    const r = compiler.compileWhere({ conditions: [{ field: 'name', operator: 'eq', value: 'Alice' }] });
    expect(r.sql).toBe('"name" = ?');
    expect(r.params).toEqual(['Alice']);
  });

  it('compiles eq null as IS NULL', () => {
    const r = compiler.compileWhere({ conditions: [{ field: 'name', operator: 'eq', value: null }] });
    expect(r.sql).toBe('"name" IS NULL');
  });

  it('compiles neq null as IS NOT NULL', () => {
    const r = compiler.compileWhere({ conditions: [{ field: 'name', operator: 'neq', value: null }] });
    expect(r.sql).toBe('"name" IS NOT NULL');
  });

  it('compiles gt/gte/lt/lte', () => {
    expect(compiler.compileWhere({ conditions: [{ field: 'age', operator: 'gt', value: 25 }] }).sql).toBe('"age" > ?');
    expect(compiler.compileWhere({ conditions: [{ field: 'age', operator: 'gte', value: 18 }] }).sql).toBe('"age" >= ?');
    expect(compiler.compileWhere({ conditions: [{ field: 'age', operator: 'lt', value: 65 }] }).sql).toBe('"age" < ?');
    expect(compiler.compileWhere({ conditions: [{ field: 'age', operator: 'lte', value: 100 }] }).sql).toBe('"age" <= ?');
  });

  it('compiles in', () => {
    const r = compiler.compileWhere({ conditions: [{ field: 'name', operator: 'in', value: ['A', 'B'] }] });
    expect(r.sql).toBe('"name" IN (?, ?)');
    expect(r.params).toEqual(['A', 'B']);
  });

  it('compiles empty in as 0', () => {
    const r = compiler.compileWhere({ conditions: [{ field: 'name', operator: 'in', value: [] }] });
    expect(r.sql).toBe('0');
  });

  it('compiles nin', () => {
    const r = compiler.compileWhere({ conditions: [{ field: 'name', operator: 'nin', value: ['C'] }] });
    expect(r.sql).toBe('"name" NOT IN (?)');
  });

  it('compiles contains/startsWith/endsWith as LIKE', () => {
    expect(compiler.compileWhere({ conditions: [{ field: 'name', operator: 'contains', value: 'li' }] }).params).toEqual(['%li%']);
    expect(compiler.compileWhere({ conditions: [{ field: 'name', operator: 'startsWith', value: 'A' }] }).params).toEqual(['A%']);
    expect(compiler.compileWhere({ conditions: [{ field: 'name', operator: 'endsWith', value: 'ce' }] }).params).toEqual(['%ce']);
  });

  it('compiles regex', () => {
    const r = compiler.compileWhere({ conditions: [{ field: 'name', operator: 'regex', value: '^A' }] });
    expect(r.sql).toBe('"name" REGEXP ?');
  });

  it('compiles between', () => {
    const r = compiler.compileWhere({ conditions: [{ field: 'age', operator: 'between', value: [18, 65] }] });
    expect(r.sql).toBe('"age" BETWEEN ? AND ?');
    expect(r.params).toEqual([18, 65]);
  });

  it('compiles multiple conditions as AND', () => {
    const f: Filter<TestEntity> = { conditions: [{ field: 'name', operator: 'eq', value: 'A' }, { field: 'age', operator: 'gte', value: 18 }] };
    const r = compiler.compileWhere(f);
    expect(r.sql).toBe('"name" = ? AND "age" >= ?');
    expect(r.params).toEqual(['A', 18]);
  });

  it('compiles OR group', () => {
    const f: Filter<TestEntity> = { or: [{ conditions: [{ field: 'name', operator: 'eq', value: 'A' }] }, { conditions: [{ field: 'name', operator: 'eq', value: 'B' }] }] };
    const r = compiler.compileWhere(f);
    expect(r.sql).toBe('("name" = ? OR "name" = ?)');
    expect(r.params).toEqual(['A', 'B']);
  });

  it('compiles AND group', () => {
    const f: Filter<TestEntity> = { conditions: [{ field: 'name', operator: 'eq', value: 'A' }], and: [{ conditions: [{ field: 'age', operator: 'gte', value: 18 }] }] };
    const r = compiler.compileWhere(f);
    expect(r.sql).toBe('"name" = ? AND ("age" >= ?)');
  });

  it('compiles sort uppercase', () => {
    expect(compiler.compileSort([{ field: 'name', direction: 'asc' }])).toBe('ORDER BY "name" ASC');
    expect(compiler.compileSort([{ field: 'age', direction: 'desc' }, { field: 'name', direction: 'asc' }])).toBe('ORDER BY "age" DESC, "name" ASC');
  });

  it('compiles pagination', () => {
    const r = compiler.compilePaginationInput(2, 10);
    expect(r.sql).toBe('LIMIT ? OFFSET ?');
    expect(r.params).toEqual([10, 10]);
  });

  it('compiles count query', () => {
    const r = compiler.compileCountQuery('users');
    expect(r.sql).toBe('SELECT COUNT(*) as count FROM "users"');
  });

  it('compiles select query', () => {
    const where = { sql: '"name" = ?', params: ['A'] };
    const sort = 'ORDER BY "name" ASC';
    const pag = { sql: 'LIMIT ? OFFSET ?', params: [10, 0] };
    const r = compiler.compileSelectQuery('users', ['id', 'name'], where, sort, pag);
    expect(r.sql).toBe('SELECT "id", "name" FROM "users" WHERE "name" = ? ORDER BY "name" ASC LIMIT ? OFFSET ?');
    expect(r.params).toEqual(['A', 10, 0]);
  });
});
