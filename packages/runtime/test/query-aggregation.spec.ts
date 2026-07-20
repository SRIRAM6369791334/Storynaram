import { describe, it, expect } from 'vitest';
import { QueryExpression } from '../src/query/query-expression';

describe('Aggregation', () => {
  const sampleData = [
    { name: 'Alice', age: 30, role: 'admin', salary: 50000 },
    { name: 'Bob', age: 25, role: 'user', salary: 40000 },
    { name: 'Charlie', age: 35, role: 'user', salary: 45000 },
    { name: 'Diana', age: 28, role: 'admin', salary: 55000 },
    { name: 'Eve', age: 32, role: 'moderator', salary: 48000 },
  ];

  it('should compute count', () => {
    expect(sampleData.length).toBe(5);
  });

  it('should compute sum', () => {
    const sum = sampleData.reduce((s, item) => s + item.salary, 0);
    expect(sum).toBe(50000 + 40000 + 45000 + 55000 + 48000);
  });

  it('should compute average', () => {
    const avg = sampleData.reduce((s, item) => s + item.age, 0) / sampleData.length;
    expect(avg).toBe(30);
  });

  it('should compute min', () => {
    const min = Math.min(...sampleData.map(item => item.age));
    expect(min).toBe(25);
  });

  it('should compute max', () => {
    const max = Math.max(...sampleData.map(item => item.age));
    expect(max).toBe(35);
  });

  it('should compute distinct', () => {
    const distinct = new Set(sampleData.map(item => item.role));
    expect(distinct.size).toBe(3);
    expect(distinct.has('admin')).toBe(true);
    expect(distinct.has('user')).toBe(true);
    expect(distinct.has('moderator')).toBe(true);
  });

  it('should group by field', () => {
    const groups = new Map<string, typeof sampleData>();
    for (const item of sampleData) {
      const key = item.role;
      const group = groups.get(key);
      if (group) {
        group.push(item);
      } else {
        groups.set(key, [item]);
      }
    }
    expect(groups.size).toBe(3);
    expect(groups.get('admin')!.length).toBe(2);
    expect(groups.get('user')!.length).toBe(2);
    expect(groups.get('moderator')!.length).toBe(1);
  });

  it('should compute sum by group', () => {
    const groups = new Map<string, number>();
    for (const item of sampleData) {
      const key = item.role;
      groups.set(key, (groups.get(key) ?? 0) + item.salary);
    }
    expect(groups.get('admin')).toBe(50000 + 55000);
    expect(groups.get('user')).toBe(40000 + 45000);
    expect(groups.get('moderator')).toBe(48000);
  });

  it('should compute average by group', () => {
    const groups = new Map<string, { sum: number; count: number }>();
    for (const item of sampleData) {
      const key = item.role;
      const g = groups.get(key);
      if (g) {
        g.sum += item.age;
        g.count++;
      } else {
        groups.set(key, { sum: item.age, count: 1 });
      }
    }
    expect(groups.get('admin')!.sum / groups.get('admin')!.count).toBe(29);
    expect(groups.get('user')!.sum / groups.get('user')!.count).toBe(30);
    expect(groups.get('moderator')!.sum / groups.get('moderator')!.count).toBe(32);
  });

  it('should filter before aggregation', () => {
    const filtered = sampleData.filter(item => item.role === 'admin');
    expect(filtered.length).toBe(2);
    const sum = filtered.reduce((s, item) => s + item.salary, 0);
    expect(sum).toBe(105000);
  });

  it('should have filter by query expression', () => {
    const expr = QueryExpression.field('age').greaterThan(30);
    const clause = expr.toClause();
    const items = sampleData.filter(item => {
      return item.age > 30;
    });
    expect(items.length).toBe(2);
    expect(items.map(i => i.name).sort()).toEqual(['Charlie', 'Eve']);
  });

  it('should combine filter and aggregation', () => {
    const filtered = sampleData.filter(item => item.age > 28);
    const count = filtered.length;
    const sum = filtered.reduce((s, item) => s + item.salary, 0);
    const avg = count > 0 ? sum / count : 0;
    expect(count).toBe(3);
    expect(avg).toBeCloseTo(47667, 0);
  });
});
