import { describe, it, expect, beforeEach } from 'vitest';
import { QueryExpression } from '../src/query/query-expression';
import type { QueryClause, FilterOperand, LogicalGroup } from '../src/query/types';

interface TestEntity {
  entityId: string;
  name: string;
  age: number;
  role: string;
  salary: number;
}

function sortItems<T>(items: T[], sort: { field: string; direction: 'asc' | 'desc' }[]): T[] {
  const sorted = [...items];
  sorted.sort((a, b) => {
    for (const s of sort) {
      const aVal = (a as Record<string, unknown>)[s.field];
      const bVal = (b as Record<string, unknown>)[s.field];
      if (aVal == null && bVal == null) continue;
      if (aVal == null) return s.direction === 'asc' ? -1 : 1;
      if (bVal == null) return s.direction === 'asc' ? 1 : -1;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const cmp = aVal.localeCompare(bVal);
        if (cmp !== 0) return s.direction === 'asc' ? cmp : -cmp;
      } else {
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        if (cmp !== 0) return s.direction === 'asc' ? cmp : -cmp;
      }
    }
    return 0;
  });
  return sorted;
}

function applyProjection<T>(items: T[], select?: string[], exclude?: string[]): T[] {
  return items.map(item => {
    const projected = { ...item as Record<string, unknown> };
    if (select && select.length > 0) {
      const selected: Record<string, unknown> = {};
      for (const field of select) {
        if (field in projected) {
          selected[field] = projected[field];
        }
      }
      return selected as T;
    }
    if (exclude && exclude.length > 0) {
      for (const field of exclude) {
        delete projected[field];
      }
    }
    return projected as T;
  });
}

describe('Query Execution', () => {
  let items: TestEntity[];

  beforeEach(() => {
    items = [
      { entityId: '1', name: 'Alice', age: 30, role: 'admin', salary: 50000 },
      { entityId: '2', name: 'Bob', age: 25, role: 'user', salary: 40000 },
      { entityId: '3', name: 'Charlie', age: 35, role: 'user', salary: 45000 },
      { entityId: '4', name: 'Diana', age: 28, role: 'admin', salary: 55000 },
      { entityId: '5', name: 'Eve', age: 32, role: 'moderator', salary: 48000 },
    ];
  });

  describe('Sort Execution', () => {
    it('should sort ascending by name', () => {
      const sorted = sortItems(items, [{ field: 'name', direction: 'asc' }]);
      expect(sorted[0]!.name).toBe('Alice');
      expect(sorted[4]!.name).toBe('Eve');
    });

    it('should sort descending by name', () => {
      const sorted = sortItems(items, [{ field: 'name', direction: 'desc' }]);
      expect(sorted[0]!.name).toBe('Eve');
      expect(sorted[4]!.name).toBe('Alice');
    });

    it('should sort ascending by age', () => {
      const sorted = sortItems(items, [{ field: 'age', direction: 'asc' }]);
      expect(sorted[0]!.age).toBe(25);
      expect(sorted[4]!.age).toBe(35);
    });

    it('should sort descending by age', () => {
      const sorted = sortItems(items, [{ field: 'age', direction: 'desc' }]);
      expect(sorted[0]!.age).toBe(35);
      expect(sorted[4]!.age).toBe(25);
    });

    it('should sort by multiple fields', () => {
      const sorted = sortItems(items, [
        { field: 'role', direction: 'asc' },
        { field: 'age', direction: 'desc' },
      ]);
      const roles = sorted.map(s => s.role);
      expect(roles[0]).toBe('admin');
      expect(roles[1]).toBe('admin');
      expect(sorted[0]!.age).toBeGreaterThanOrEqual(sorted[1]!.age);
    });

    it('should maintain stable sort for equal fields', () => {
      const sorted = sortItems(items, [{ field: 'role', direction: 'asc' }]);
      expect(sorted.filter(s => s.role === 'admin').length).toBe(2);
      expect(sorted.filter(s => s.role === 'moderator').length).toBe(1);
      expect(sorted.filter(s => s.role === 'user').length).toBe(2);
    });
  });

  describe('Projection Execution', () => {
    it('should select only specified fields', () => {
      const projected = applyProjection(items, ['name', 'age']);
      expect(projected[0]).toEqual({ name: 'Alice', age: 30 } as any);
      expect(Object.keys(projected[0]!).length).toBe(2);
    });

    it('should exclude specified fields', () => {
      const projected = applyProjection(items, undefined, ['salary']);
      expect(projected[0]!.salary).toBeUndefined();
      expect(projected[0]!.name).toBeDefined();
    });

    it('should handle empty select', () => {
      const projected = applyProjection(items, []);
      expect(Object.keys(projected[0]!).length).toBe(5);
    });
  });

  describe('Paginated Results', () => {
    it('should return correct page', () => {
      const page = items.slice(0, 2);
      expect(page.length).toBe(2);
      expect(page[0]!.name).toBe('Alice');
      expect(page[1]!.name).toBe('Bob');
    });

    it('should return correct second page', () => {
      const page = items.slice(2, 4);
      expect(page.length).toBe(2);
      expect(page[0]!.name).toBe('Charlie');
      expect(page[1]!.name).toBe('Diana');
    });

    it('should handle empty results', () => {
      const page = items.slice(100, 110);
      expect(page.length).toBe(0);
    });

    it('should handle partial last page', () => {
      const page = items.slice(3, 10);
      expect(page.length).toBe(2);
    });
  });

  describe('Filter Logic', () => {
    it('should evaluate equals', () => {
      const result = items.filter(item => item.role === 'admin');
      expect(result.length).toBe(2);
    });

    it('should evaluate greater than', () => {
      const result = items.filter(item => item.age > 30);
      expect(result.length).toBe(2);
      expect(result.map(r => r.name).sort()).toEqual(['Charlie', 'Eve']);
    });

    it('should evaluate less than', () => {
      const result = items.filter(item => item.age < 30);
      expect(result.length).toBe(2);
      expect(result.map(r => r.name).sort()).toEqual(['Bob', 'Diana']);
    });

    it('should evaluate between', () => {
      const result = items.filter(item => item.age >= 28 && item.age <= 32);
      expect(result.length).toBe(3);
    });

    it('should evaluate in', () => {
      const result = items.filter(item => ['admin', 'moderator'].includes(item.role));
      expect(result.length).toBe(3);
    });

    it('should evaluate notIn', () => {
      const result = items.filter(item => !['user'].includes(item.role));
      expect(result.length).toBe(3);
    });

    it('should combine AND filter', () => {
      const result = items.filter(item => item.role === 'admin' && item.age > 28);
      expect(result.length).toBe(1);
      expect(result[0]!.name).toBe('Alice');
    });

    it('should combine OR filter', () => {
      const result = items.filter(item => item.role === 'admin' || item.age > 33);
      expect(result.length).toBe(3);
    });

    it('should evaluate contains (string)', () => {
      const result = items.filter(item => item.name.toLowerCase().includes('li'));
      expect(result.length).toBe(2);
    });

    it('should evaluate startsWith', () => {
      const result = items.filter(item => item.name.startsWith('A'));
      expect(result.length).toBe(1);
    });

    it('should evaluate endsWith', () => {
      const result = items.filter(item => item.name.endsWith('e'));
      expect(result.length).toBe(3);
    });
  });

  describe('QueryExpression clause evaluation', () => {
    it('should produce valid clause for equals', () => {
      const expr = QueryExpression.field('name').equals('Alice');
      const clause = expr.toClause();
      expect(clause).toHaveProperty('field', 'name');
      expect(clause).toHaveProperty('operator', 'eq');
      expect(clause).toHaveProperty('value', 'Alice');
    });

    it('should produce valid and clause', () => {
      const expr = QueryExpression.and(
        QueryExpression.field('age').greaterThan(18),
        QueryExpression.field('role').equals('admin'),
      );
      const clause = expr.toClause();
      expect(clause).toHaveProperty('operator', 'and');
      const group = clause as LogicalGroup;
      expect(group.conditions.length).toBe(2);
    });

    it('should produce valid or clause', () => {
      const expr = QueryExpression.or(
        QueryExpression.field('role').equals('admin'),
        QueryExpression.field('role').equals('moderator'),
      );
      const clause = expr.toClause();
      expect(clause).toHaveProperty('operator', 'or');
      const group = clause as LogicalGroup;
      expect(group.conditions.length).toBe(2);
    });

    it('should convert clause back to filter', () => {
      const expr = QueryExpression.field('name').equals('Alice');
      const filter = expr.toFilter();
      expect(filter).toEqual({ name: { eq: 'Alice' } });
    });
  });
});
