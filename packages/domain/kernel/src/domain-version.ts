export class DomainVersion {
  constructor(public readonly value: number) {
    if (value < 0) {
      throw new Error(`DomainVersion cannot be negative: ${value}`);
    }
  }

  static initial(): DomainVersion {
    return new DomainVersion(1);
  }

  static zero(): DomainVersion {
    return new DomainVersion(0);
  }

  next(): DomainVersion {
    return new DomainVersion(this.value + 1);
  }

  equals(other: DomainVersion): boolean {
    if (other === null || other === undefined) return false;
    return this.value === other.value;
  }

  isOlderThan(other: DomainVersion): boolean {
    return this.value < other.value;
  }

  isNewerThan(other: DomainVersion): boolean {
    return this.value > other.value;
  }

  toString(): string {
    return String(this.value);
  }

  toJSON(): number {
    return this.value;
  }
}
