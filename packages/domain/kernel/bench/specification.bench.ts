import { bench, describe } from 'vitest';
import { Specification, CompositeSpecification } from '../src/specification';

class EvenSpec extends Specification<number> {
  isSatisfiedBy(c: number): boolean { return c % 2 === 0; }
}

class PositiveSpec extends Specification<number> {
  isSatisfiedBy(c: number): boolean { return c > 0; }
}

class GreaterThanSpec extends Specification<number> {
  constructor(private readonly t: number) { super(); }
  isSatisfiedBy(c: number): boolean { return c > this.t; }
}

class RangeSpec extends Specification<number> {
  constructor(private readonly min: number, private readonly max: number) { super(); }
  isSatisfiedBy(c: number): boolean { return c >= this.min && c <= this.max; }
}

describe('Specification evaluation', () => {
  const spec = new EvenSpec().and(new PositiveSpec()).and(new GreaterThanSpec(10)).and(new RangeSpec(1, 1000));
  const composite = new CompositeSpecification<number>([new EvenSpec(), new PositiveSpec(), new GreaterThanSpec(10), new RangeSpec(1, 1000)]);
  const numbers: number[] = [];

  for (let i = 0; i < 1000; i++) {
    numbers.push(i);
  }

  bench('chained specification (1000 nums)', () => {
    for (const n of numbers) {
      spec.isSatisfiedBy(n);
    }
  });

  bench('composite specification (1000 nums)', () => {
    for (const n of numbers) {
      composite.isSatisfiedBy(n);
    }
  });

  bench('single specification (1000 nums)', () => {
    const single = new EvenSpec();
    for (const n of numbers) {
      single.isSatisfiedBy(n);
    }
  });
});
