import { describe, it, expect } from 'vitest';
import { ValueObject } from '../src/value-object';

class TestValueObject extends ValueObject {
  constructor(
    public readonly name: string,
    public readonly age: number,
  ) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.name, this.age];
  }

  toJSON(): Record<string, unknown> {
    return { name: this.name, age: this.age };
  }
}

class OtherValueObject extends ValueObject {
  constructor(public readonly value: string) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }

  toJSON(): Record<string, unknown> {
    return { value: this.value };
  }
}

describe('ValueObject', () => {
  it('equals same values', () => {
    const a = new TestValueObject('foo', 10);
    const b = new TestValueObject('foo', 10);
    expect(a.equals(b)).toBe(true);
  });

  it('not equals different values', () => {
    const a = new TestValueObject('foo', 10);
    const b = new TestValueObject('bar', 10);
    expect(a.equals(b)).toBe(false);
  });

  it('not equals different type', () => {
    const a = new TestValueObject('foo', 10);
    const b = new OtherValueObject('foo');
    expect(a.equals(b as unknown as TestValueObject)).toBe(false);
  });

  it('not equals null', () => {
    const a = new TestValueObject('foo', 10);
    expect(a.equals(null as unknown as TestValueObject)).toBe(false);
  });

  it('not equals undefined', () => {
    const a = new TestValueObject('foo', 10);
    expect(a.equals(undefined as unknown as TestValueObject)).toBe(false);
  });

  it('toJSON returns properties', () => {
    const vo = new TestValueObject('test', 25);
    expect(vo.toJSON()).toEqual({ name: 'test', age: 25 });
  });
});
