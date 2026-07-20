import { describe, it, expect } from 'vitest';
import { Specification, CompositeSpecification } from '../src/specification';

class EvenNumberSpec extends Specification<number> {
  isSatisfiedBy(candidate: number): boolean {
    return candidate % 2 === 0;
  }
}

class PositiveNumberSpec extends Specification<number> {
  isSatisfiedBy(candidate: number): boolean {
    return candidate > 0;
  }
}

class GreaterThanSpec extends Specification<number> {
  constructor(private readonly threshold: number) {
    super();
  }

  isSatisfiedBy(candidate: number): boolean {
    return candidate > this.threshold;
  }
}

describe('Specification', () => {
  it('basic satisfaction', () => {
    const even = new EvenNumberSpec();
    expect(even.isSatisfiedBy(2)).toBe(true);
    expect(even.isSatisfiedBy(3)).toBe(false);
  });

  it('and-composition', () => {
    const even = new EvenNumberSpec();
    const positive = new PositiveNumberSpec();
    const combined = even.and(positive);
    expect(combined.isSatisfiedBy(4)).toBe(true);
    expect(combined.isSatisfiedBy(-2)).toBe(false);
    expect(combined.isSatisfiedBy(3)).toBe(false);
  });

  it('or-composition', () => {
    const even = new EvenNumberSpec();
    const positive = new PositiveNumberSpec();
    const combined = even.or(positive);
    expect(combined.isSatisfiedBy(4)).toBe(true);
    expect(combined.isSatisfiedBy(-2)).toBe(true);
    expect(combined.isSatisfiedBy(-1)).toBe(false);
  });

  it('not-composition', () => {
    const even = new EvenNumberSpec();
    const odd = even.not();
    expect(odd.isSatisfiedBy(1)).toBe(true);
    expect(odd.isSatisfiedBy(2)).toBe(false);
  });

  it('chained composition', () => {
    const even = new EvenNumberSpec();
    const positive = new PositiveNumberSpec();
    const greaterThan10 = new GreaterThanSpec(10);
    const spec = even.and(positive).and(greaterThan10);
    expect(spec.isSatisfiedBy(12)).toBe(true);
    expect(spec.isSatisfiedBy(8)).toBe(false);
    expect(spec.isSatisfiedBy(11)).toBe(false);
  });
});

describe('CompositeSpecification', () => {
  it('empty composite is satisfied', () => {
    const composite = new CompositeSpecification<number>();
    expect(composite.isSatisfiedBy(42)).toBe(true);
  });

  it('all specs must be satisfied', () => {
    const composite = new CompositeSpecification<number>();
    composite.add(new EvenNumberSpec());
    composite.add(new PositiveNumberSpec());
    expect(composite.isSatisfiedBy(4)).toBe(true);
    expect(composite.isSatisfiedBy(-2)).toBe(false);
    expect(composite.isSatisfiedBy(3)).toBe(false);
  });

  it('accepts initial specs in constructor', () => {
    const composite = new CompositeSpecification<number>([
      new EvenNumberSpec(),
      new PositiveNumberSpec(),
    ]);
    expect(composite.isSatisfiedBy(4)).toBe(true);
  });
});
