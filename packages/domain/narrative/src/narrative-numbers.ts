import { ValueObject } from '@storynaram/domain-kernel';

export class ChapterNumber extends ValueObject {
  constructor(public readonly value: number) {
    super();
    if (value < 1) throw new Error(`Chapter number must be >= 1: ${value}`);
  }

  get formatted(): string {
    return `Chapter ${this.value}`;
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }

  toJSON(): Record<string, unknown> { return { value: this.value }; }
}

export class SceneNumber extends ValueObject {
  constructor(public readonly value: number) {
    super();
    if (value < 1) throw new Error(`Scene number must be >= 1: ${value}`);
  }

  get formatted(): string {
    return `Scene ${this.value}`;
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }

  toJSON(): Record<string, unknown> { return { value: this.value }; }
}

export class BeatNumber extends ValueObject {
  constructor(public readonly value: number) {
    super();
    if (value < 1) throw new Error(`Beat number must be >= 1: ${value}`);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }

  toJSON(): Record<string, unknown> { return { value: this.value }; }
}

export class DialogueOrder extends ValueObject {
  constructor(public readonly value: number) {
    super();
    if (value < 1) throw new Error(`Dialogue order must be >= 1: ${value}`);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }

  toJSON(): Record<string, unknown> { return { value: this.value }; }
}
