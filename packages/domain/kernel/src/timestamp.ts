export class Timestamp {
  public readonly value: Date;

  private constructor(value: Date) {
    this.value = value;
  }

  static now(): Timestamp {
    return new Timestamp(new Date());
  }

  static from(date: Date): Timestamp {
    return new Timestamp(new Date(date.getTime()));
  }

  static fromISOString(iso: string): Timestamp {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid ISO string: ${iso}`);
    }
    return new Timestamp(date);
  }

  equals(other: Timestamp): boolean {
    if (other === null || other === undefined) return false;
    return this.value.getTime() === other.value.getTime();
  }

  isBefore(other: Timestamp): boolean {
    return this.value.getTime() < other.value.getTime();
  }

  isAfter(other: Timestamp): boolean {
    return this.value.getTime() > other.value.getTime();
  }

  isBeforeOrEqual(other: Timestamp): boolean {
    return this.value.getTime() <= other.value.getTime();
  }

  isAfterOrEqual(other: Timestamp): boolean {
    return this.value.getTime() >= other.value.getTime();
  }

  toISOString(): string {
    return this.value.toISOString();
  }

  toJSON(): string {
    return this.value.toISOString();
  }

  elapsed(): number {
    return Date.now() - this.value.getTime();
  }
}
