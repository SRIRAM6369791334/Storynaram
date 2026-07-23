import type { Filter } from './types.js';

export abstract class Specification<T> {
  abstract satisfiedBy(item: T): boolean;

  and(spec: Specification<T>): Specification<T> {
    return new AndSpecification(this, spec);
  }

  or(spec: Specification<T>): Specification<T> {
    return new OrSpecification(this, spec);
  }

  not(): Specification<T> {
    return new NotSpecification(this);
  }

  toFilter(): Filter<T> {
    return {};
  }
}

class AndSpecification<T> extends Specification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>,
  ) {
    super();
  }

  override satisfiedBy(item: T): boolean {
    return this.left.satisfiedBy(item) && this.right.satisfiedBy(item);
  }

  override toFilter(): Filter<T> {
    return { and: [this.left.toFilter(), this.right.toFilter()] };
  }
}

class OrSpecification<T> extends Specification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>,
  ) {
    super();
  }

  override satisfiedBy(item: T): boolean {
    return this.left.satisfiedBy(item) || this.right.satisfiedBy(item);
  }

  override toFilter(): Filter<T> {
    return { or: [this.left.toFilter(), this.right.toFilter()] };
  }
}

class NotSpecification<T> extends Specification<T> {
  constructor(private readonly spec: Specification<T>) {
    super();
  }

  override satisfiedBy(item: T): boolean {
    return !this.spec.satisfiedBy(item);
  }

  override toFilter(): Filter<T> {
    return { conditions: [{ field: '__not__', operator: 'eq', value: this.spec.toFilter() }] };
  }
}

export class FieldSpecification<T> extends Specification<T> {
  constructor(
    private readonly field: keyof T,
    private readonly operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'regex' | 'in',
    private readonly expected: unknown,
  ) {
    super();
  }

  override satisfiedBy(item: T): boolean {
    const value = item[this.field];
    switch (this.operator) {
      case 'eq': return value === this.expected;
      case 'neq': return value !== this.expected;
      case 'gt': return (value as number) > (this.expected as number);
      case 'gte': return (value as number) >= (this.expected as number);
      case 'lt': return (value as number) < (this.expected as number);
      case 'lte': return (value as number) <= (this.expected as number);
      case 'contains': return String(value).includes(String(this.expected));
      case 'startsWith': return String(value).startsWith(String(this.expected));
      case 'endsWith': return String(value).endsWith(String(this.expected));
      case 'regex': return new RegExp(String(this.expected)).test(String(value));
      case 'in': return Array.isArray(this.expected) && this.expected.includes(value);
      default: return false;
    }
  }

  override toFilter(): Filter<T> {
    return { conditions: [{ field: String(this.field), operator: this.operator, value: this.expected }] };
  }
}

export class CompositeSpecification<T> extends Specification<T> {
  constructor(
    private readonly predicate: (item: T) => boolean,
  ) {
    super();
  }

  override satisfiedBy(item: T): boolean {
    return this.predicate(item);
  }
}
