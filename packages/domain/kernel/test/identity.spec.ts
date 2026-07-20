import { describe, it, expect } from 'vitest';
import { Identity } from '../src/identity';

describe('Identity', () => {
  it('creates with a string value', () => {
    const id = new Identity('abc-123');
    expect(id.value).toBe('abc-123');
  });

  it('creates with a number value', () => {
    const id = new Identity(42);
    expect(id.value).toBe(42);
  });

  it('equals same value', () => {
    const a = new Identity('x');
    const b = new Identity('x');
    expect(a.equals(b)).toBe(true);
  });

  it('not equals different value', () => {
    const a = new Identity('x');
    const b = new Identity('y');
    expect(a.equals(b)).toBe(false);
  });

  it('not equals null', () => {
    const id = new Identity('x');
    expect(id.equals(null as unknown as Identity)).toBe(false);
  });

  it('not equals undefined', () => {
    const id = new Identity('x');
    expect(id.equals(undefined as unknown as Identity)).toBe(false);
  });

  it('toString returns string value', () => {
    const id = new Identity(42);
    expect(id.toString()).toBe('42');
  });

  it('toJSON returns raw value', () => {
    const id = new Identity('abc');
    expect(id.toJSON()).toBe('abc');
  });
});
