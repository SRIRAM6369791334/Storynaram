import { describe, it, expect } from 'vitest';
import { QueryCompiler } from '../src/query/query-compiler';
import type { Filter } from '@storynaram/runtime';

interface TestEntity {
  entityId: string;
  name: string;
  age: number;
}

describe('QueryCompiler', () => {
  const compiler = new QueryCompiler();

  describe('compileWhere', () => {
    it('returns empty when no filter provided', () => {
      const result = compiler.compileWhere(undefined);
      expect(result.sql).toBe('');
      expect(result.params).toEqual([]);
    });

    it('compiles eq condition', () => {
      const filter: Filter<TestEntity> = {
        conditions: [{ field: 'name', operator: 'eq', value: 'Alice' }],
      };
      const result = compiler.compileWhere(filter);
      expect(result.sql).toBe('"name" = $1');
      expect(result.params).toEqual(['Alice']);
    });

    it('compiles eq null as IS NULL', () => {
      const filter: Filter<TestEntity> = {
        conditions: [{ field: 'name', operator: 'eq', value: null }],
      };
      const result = compiler.compileWhere(filter);
      expect(result.sql).toBe('"name" IS NULL');
      expect(result.params).toEqual([]);
    });

    it('compiles neq null as IS NOT NULL', () => {
      const filter: Filter<TestEntity> = {
        conditions: [{ field: 'name', operator: 'neq', value: null }],
      };
      const result = compiler.compileWhere(filter);
      expect(result.sql).toBe('"name" IS NOT NULL');
      expect(result.params).toEqual([]);
    });

    it('compiles gt condition', () => {
      const filter: Filter<TestEntity> = {
        conditions: [{ field: 'age', operator: 'gt', value: 25 }],
      };
      const result = compiler.compileWhere(filter);
      expect(result.sql).toBe('"age" > $1');
      expect(result.params).toEqual([25]);
    });

    it('compiles gte condition', () => {
      const filter: Filter<TestEntity> = {
        conditions: [{ field: 'age', operator: 'gte', value: 18 }],
      };
      const result = compiler.compileWhere(filter);
      expect(result.sql).toBe('"age" >= $1');
      expect(result.params).toEqual([18]);
    });

    it('compiles lt condition', () => {
      const filter: Filter<TestEntity> = {
        conditions: [{ field: 'age', operator: 'lt', value: 65 }],
      };
      const result = compiler.compileWhere(filter);
      expect(result.sql).toBe('"age" < $1');
      expect(result.params).toEqual([65]);
    });

    it('compiles lte condition', () => {
      const filter: Filter<TestEntity> = {
        conditions: [{ field: 'age', operator: 'lte', value: 100 }],
      };
      const result = compiler.compileWhere(filter);
      expect(result.sql).toBe('"age" <= $1');
      expect(result.params).toEqual([100]);
    });

    it('compiles in condition', () => {
      const filter: Filter<TestEntity> = {
        conditions: [{ field: 'name', operator: 'in', value: ['Alice', 'Bob'] }],
      };
      const result = compiler.compileWhere(filter);
      expect(result.sql).toBe('"name" IN ($1, $2)');
      expect(result.params).toEqual(['Alice', 'Bob']);
    });

    it('compiles empty in as false', () => {
      const filter: Filter<TestEntity> = {
        conditions: [{ field: 'name', operator: 'in', value: [] }],
      };
      const result = compiler.compileWhere(filter);
      expect(result.sql).toBe('1=0');
    });

    it('compiles nin condition', () => {
      const filter: Filter<TestEntity> = {
        conditions: [{ field: 'name', operator: 'nin', value: ['Charlie'] }],
      };
      const result = compiler.compileWhere(filter);
      expect(result.sql).toBe('"name" NOT IN ($1)');
      expect(result.params).toEqual(['Charlie']);
    });

    it('compiles contains as LIKE', () => {
      const filter: Filter<TestEntity> = {
        conditions: [{ field: 'name', operator: 'contains', value: 'li' }],
      };
      const result = compiler.compileWhere(filter);
      expect(result.sql).toBe('"name" LIKE $1');
      expect(result.params).toEqual(['%li%']);
    });

    it('compiles startsWith as LIKE', () => {
      const filter: Filter<TestEntity> = {
        conditions: [{ field: 'name', operator: 'startsWith', value: 'A' }],
      };
      const result = compiler.compileWhere(filter);
      expect(result.sql).toBe('"name" LIKE $1');
      expect(result.params).toEqual(['A%']);
    });

    it('compiles endsWith as LIKE', () => {
      const filter: Filter<TestEntity> = {
        conditions: [{ field: 'name', operator: 'endsWith', value: 'ce' }],
      };
      const result = compiler.compileWhere(filter);
      expect(result.sql).toBe('"name" LIKE $1');
      expect(result.params).toEqual(['%ce']);
    });

    it('compiles regex as ~', () => {
      const filter: Filter<TestEntity> = {
        conditions: [{ field: 'name', operator: 'regex', value: '^A.*' }],
      };
      const result = compiler.compileWhere(filter);
      expect(result.sql).toBe('"name" ~ $1');
      expect(result.params).toEqual(['^A.*']);
    });

    it('compiles between condition', () => {
      const filter: Filter<TestEntity> = {
        conditions: [{ field: 'age', operator: 'between', value: [18, 65] }],
      };
      const result = compiler.compileWhere(filter);
      expect(result.sql).toBe('"age" BETWEEN $1 AND $2');
      expect(result.params).toEqual([18, 65]);
    });

    it('compiles empty between as false', () => {
      const filter: Filter<TestEntity> = {
        conditions: [{ field: 'age', operator: 'between', value: [] }],
      };
      const result = compiler.compileWhere(filter);
      expect(result.sql).toBe('1=0');
    });

    it('compiles multiple conditions as AND', () => {
      const filter: Filter<TestEntity> = {
        conditions: [
          { field: 'name', operator: 'eq', value: 'Alice' },
          { field: 'age', operator: 'gte', value: 18 },
        ],
      };
      const result = compiler.compileWhere(filter);
      expect(result.sql).toBe('"name" = $1 AND "age" >= $2');
      expect(result.params).toEqual(['Alice', 18]);
    });

    it('compiles AND group', () => {
      const filter: Filter<TestEntity> = {
        conditions: [{ field: 'name', operator: 'eq', value: 'Alice' }],
        and: [{
          conditions: [{ field: 'age', operator: 'gte', value: 18 }],
        }],
      };
      const result = compiler.compileWhere(filter);
      expect(result.sql).toBe('"name" = $1 AND ("age" >= $2)');
      expect(result.params).toEqual(['Alice', 18]);
    });

    it('compiles OR group', () => {
      const filter: Filter<TestEntity> = {
        or: [
          { conditions: [{ field: 'name', operator: 'eq', value: 'Alice' }] },
          { conditions: [{ field: 'name', operator: 'eq', value: 'Bob' }] },
        ],
      };
      const result = compiler.compileWhere(filter);
      expect(result.sql).toBe('("name" = $1 OR "name" = $2)');
      expect(result.params).toEqual(['Alice', 'Bob']);
    });
  });

  describe('compileSort', () => {
    it('returns empty when no sort provided', () => {
      expect(compiler.compileSort(undefined)).toBe('');
    });

    it('compiles single sort field', () => {
      const result = compiler.compileSort([{ field: 'name', direction: 'asc' }]);
      expect(result).toBe('ORDER BY "name" ASC');
    });

    it('compiles multiple sort fields', () => {
      const result = compiler.compileSort([
        { field: 'age', direction: 'desc' },
        { field: 'name', direction: 'asc' },
      ]);
      expect(result).toBe('ORDER BY "age" DESC, "name" ASC');
    });
  });

  describe('compilePaginationInput', () => {
    it('compiles offset pagination correctly', () => {
      const result = compiler.compilePaginationInput(2, 10, 1);
      expect(result.sql).toBe('LIMIT $1 OFFSET $2');
      expect(result.params).toEqual([10, 10]);
    });

    it('handles first page', () => {
      const result = compiler.compilePaginationInput(1, 20, 1);
      expect(result.params).toEqual([20, 0]);
    });
  });

  describe('compileCountQuery', () => {
    it('generates simple count', () => {
      const result = compiler.compileCountQuery('users');
      expect(result.sql).toBe('SELECT COUNT(*) as count FROM "users"');
      expect(result.params).toEqual([]);
    });

    it('generates count with where clause', () => {
      const where = { sql: '"age" > $1', params: [18] };
      const result = compiler.compileCountQuery('users', where);
      expect(result.sql).toBe('SELECT COUNT(*) as count FROM "users" WHERE "age" > $1');
      expect(result.params).toEqual([18]);
    });
  });

  describe('compileSelectQuery', () => {
    it('generates simple select', () => {
      const result = compiler.compileSelectQuery('users');
      expect(result.sql).toBe('SELECT * FROM "users"');
    });

    it('generates select with columns', () => {
      const result = compiler.compileSelectQuery('users', ['id', 'name']);
      expect(result.sql).toBe('SELECT "id", "name" FROM "users"');
    });

    it('generates select with where', () => {
      const where = { sql: '"name" = $1', params: ['Alice'] };
      const result = compiler.compileSelectQuery('users', ['*'], where);
      expect(result.sql).toBe('SELECT * FROM "users" WHERE "name" = $1');
      expect(result.params).toEqual(['Alice']);
    });

    it('generates full select with where, sort, pagination', () => {
      const where = { sql: '"age" > $1', params: [18] };
      const sort = 'ORDER BY "name" ASC';
      const pagination = { sql: 'LIMIT $2 OFFSET $3', params: [10, 0] };
      const result = compiler.compileSelectQuery('users', ['id', 'name'], where, sort, pagination);
      expect(result.sql).toBe('SELECT "id", "name" FROM "users" WHERE "age" > $1 ORDER BY "name" ASC LIMIT $2 OFFSET $3');
      expect(result.params).toEqual([18, 10, 0]);
    });
  });
});
