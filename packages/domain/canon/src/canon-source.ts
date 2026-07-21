import { ValueObject } from '@storynaram/domain-kernel';

export type SourceType = 'character' | 'world' | 'timeline' | 'user' | 'system' | 'import';

export class CanonSource extends ValueObject {
  constructor(
    public readonly sourceType: SourceType,
    public readonly sourceId: string,
    public readonly timestamp: Date = new Date(),
  ) {
    super();
    if (sourceType.trim().length === 0) throw new Error('Source type cannot be empty');
    if (sourceId.trim().length === 0) throw new Error('Source ID cannot be empty');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.sourceType, this.sourceId, this.timestamp.getTime()];
  }

  toJSON(): Record<string, unknown> {
    return {
      sourceType: this.sourceType,
      sourceId: this.sourceId,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
