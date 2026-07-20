function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return a === b;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => deepEqual(val, b[i]));
  }

  const aKeys = Object.keys(a as Record<string, unknown>);
  const bKeys = Object.keys(b as Record<string, unknown>);
  if (aKeys.length !== bKeys.length) return false;

  return aKeys.every(key =>
    deepEqual(
      (a as Record<string, unknown>)[key],
      (b as Record<string, unknown>)[key],
    ),
  );
}

export abstract class ValueObject {
  protected abstract getEqualityComponents(): unknown[];

  equals(other: this): boolean {
    if (other === null || other === undefined) return false;
    if (other.constructor !== this.constructor) return false;
    const left = this.getEqualityComponents();
    const right = other.getEqualityComponents();
    if (left.length !== right.length) return false;
    return left.every((val, idx) => deepEqual(val, right[idx]));
  }

  abstract toJSON(): Record<string, unknown>;
}
