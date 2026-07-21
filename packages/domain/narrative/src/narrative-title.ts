import { ValueObject } from '@storynaram/domain-kernel';

export class NarrativeTitle extends ValueObject {
  constructor(public readonly value: string) {
    super();
    if (value.trim().length === 0) throw new Error('Title cannot be empty');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value.toLowerCase()];
  }

  toJSON(): Record<string, unknown> { return { value: this.value }; }
}

export class Subtitle extends ValueObject {
  constructor(public readonly value: string) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value.toLowerCase()];
  }

  toJSON(): Record<string, unknown> { return { value: this.value }; }
}
