import { ValueObject } from '@storynaram/domain-kernel';

export class WordCount extends ValueObject {
  constructor(public readonly value: number) {
    super();
    if (value < 0) throw new Error(`Word count cannot be negative: ${value}`);
  }

  add(other: WordCount): WordCount {
    return new WordCount(this.value + other.value);
  }

  static zero(): WordCount {
    return new WordCount(0);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }

  toJSON(): Record<string, unknown> { return { value: this.value }; }
}

export class ReadingTime extends ValueObject {
  public readonly minutes: number;

  constructor(wordCount: WordCount, wordsPerMinute: number = 250) {
    super();
    this.minutes = Math.ceil(wordCount.value / wordsPerMinute);
    if (this.minutes < 0) throw new Error('Reading time cannot be negative');
  }

  get formatted(): string {
    if (this.minutes < 60) return `${this.minutes}m`;
    const h = Math.floor(this.minutes / 60);
    const m = this.minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  protected getEqualityComponents(): unknown[] {
    return [this.minutes];
  }

  toJSON(): Record<string, unknown> { return { value: this.minutes }; }
}
