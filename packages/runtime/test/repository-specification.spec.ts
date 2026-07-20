import { describe, it, expect } from 'vitest';
import { FieldSpecification, CompositeSpecification } from '../src/repository/specification';

interface TestItem {
  name: string;
  age: number;
  active: boolean;
}

describe('Specification pattern', () => {
  const items: TestItem[] = [
    { name: 'Alice', age: 30, active: true },
    { name: 'Bob', age: 25, active: false },
    { name: 'Charlie', age: 35, active: true },
  ];

  it('FieldSpecification eq', () => {
    const spec = new FieldSpecification<TestItem>('name', 'eq', 'Alice');
    expect(spec.satisfiedBy(items[0]!)).toBe(true);
    expect(spec.satisfiedBy(items[1]!)).toBe(false);
  });

  it('FieldSpecification gt', () => {
    const spec = new FieldSpecification<TestItem>('age', 'gt', 28);
    expect(spec.satisfiedBy(items[0]!)).toBe(true);
    expect(spec.satisfiedBy(items[1]!)).toBe(false);
  });

  it('FieldSpecification contains', () => {
    const spec = new FieldSpecification<TestItem>('name', 'contains', 'li');
    expect(spec.satisfiedBy(items[0]!)).toBe(true);
    expect(spec.satisfiedBy(items[1]!)).toBe(false);
  });

  it('and composition', () => {
    const active = new FieldSpecification<TestItem>('active', 'eq', true);
    const over30 = new FieldSpecification<TestItem>('age', 'gt', 28);
    const combined = active.and(over30);
    expect(combined.satisfiedBy(items[0]!)).toBe(true);
    expect(combined.satisfiedBy(items[2]!)).toBe(true);
    expect(combined.satisfiedBy(items[1]!)).toBe(false);
  });

  it('or composition', () => {
    const isAlice = new FieldSpecification<TestItem>('name', 'eq', 'Alice');
    const isBob = new FieldSpecification<TestItem>('name', 'eq', 'Bob');
    const combined = isAlice.or(isBob);
    expect(combined.satisfiedBy(items[0]!)).toBe(true);
    expect(combined.satisfiedBy(items[1]!)).toBe(true);
    expect(combined.satisfiedBy(items[2]!)).toBe(false);
  });

  it('not composition', () => {
    const isAlice = new FieldSpecification<TestItem>('name', 'eq', 'Alice');
    const notAlice = isAlice.not();
    expect(notAlice.satisfiedBy(items[0]!)).toBe(false);
    expect(notAlice.satisfiedBy(items[1]!)).toBe(true);
  });

  it('CompositeSpecification with custom predicate', () => {
    const spec = new CompositeSpecification<TestItem>(item => item.name.startsWith('A'));
    expect(spec.satisfiedBy(items[0]!)).toBe(true);
    expect(spec.satisfiedBy(items[1]!)).toBe(false);
  });
});
