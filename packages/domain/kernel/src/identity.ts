export class Identity<T = string> {
  constructor(public readonly value: T) {}

  equals(other: Identity<T>): boolean {
    if (other === null || other === undefined) return false;
    return this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }

  toJSON(): T {
    return this.value;
  }
}
