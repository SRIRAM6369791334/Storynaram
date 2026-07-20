import { describe, bench } from 'vitest';
import { QueryCompiler } from '../src/query/query-compiler';
import type { Filter } from '@storynaram/runtime';

interface BenchEntity {
  entityId: string;
  name: string;
  age: number;
  email: string;
  status: string;
  createdAt: Date;
}

describe('QueryCompiler Benchmarks', () => {
  const compiler = new QueryCompiler();

  bench('compile simple eq filter', () => {
    const filter: Filter<BenchEntity> = {
      conditions: [{ field: 'name', operator: 'eq', value: 'Alice' }],
    };
    compiler.compileWhere(filter);
  });

  bench('compile complex filter with AND/OR', () => {
    const filter: Filter<BenchEntity> = {
      conditions: [
        { field: 'status', operator: 'eq', value: 'active' },
        { field: 'age', operator: 'gte', value: 18 },
      ],
      or: [
        { conditions: [{ field: 'name', operator: 'contains', value: 'Admin' }] },
        { conditions: [{ field: 'role', operator: 'eq', value: 'moderator' }] },
      ],
    };
    compiler.compileWhere(filter);
  });

  bench('compile filter with IN operator (100 values)', () => {
    const ids = Array.from({ length: 100 }, (_, i) => `id-${i}`);
    const filter: Filter<BenchEntity> = {
      conditions: [{ field: 'entityId', operator: 'in', value: ids }],
    };
    compiler.compileWhere(filter);
  });

  bench('compile sort with 5 fields', () => {
    compiler.compileSort([
      { field: 'status', direction: 'asc' },
      { field: 'age', direction: 'desc' },
      { field: 'name', direction: 'asc' },
      { field: 'createdAt', direction: 'desc' },
      { field: 'email', direction: 'asc' },
    ]);
  });

  bench('compile full select query', () => {
    const filter = compiler.compileWhere({
      conditions: [
        { field: 'status', operator: 'eq', value: 'active' },
        { field: 'age', operator: 'between', value: [18, 65] },
      ],
    });
    const sort = compiler.compileSort([{ field: 'name', direction: 'asc' }]);
    const pagination = compiler.compilePaginationInput(1, 20, filter.params.length + 1);
    compiler.compileSelectQuery('bench_entities', ['id', 'name', 'age', 'email'], filter, sort, pagination);
  });

  bench('compile 1000 unique filters sequentially', () => {
    for (let i = 0; i < 1000; i++) {
      const filter: Filter<BenchEntity> = {
        conditions: [
          { field: 'name', operator: 'eq', value: `User-${i}` },
          { field: 'age', operator: 'gte', value: i % 100 },
        ],
      };
      compiler.compileWhere(filter);
    }
  });
});
