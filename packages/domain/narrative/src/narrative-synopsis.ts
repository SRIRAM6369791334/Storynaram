import { ValueObject } from '@storynaram/domain-kernel';

export class Synopsis extends ValueObject {
  constructor(public readonly value: string) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value.length];
  }

  toJSON(): Record<string, unknown> { return { value: this.value }; }
}

export class Summary extends ValueObject {
  constructor(public readonly value: string) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value.length];
  }

  toJSON(): Record<string, unknown> { return { value: this.value }; }
}
