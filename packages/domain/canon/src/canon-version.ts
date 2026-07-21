import { ValueObject } from '@storynaram/domain-kernel';
import { CanonFact } from './canon-fact';

export class CanonVersion extends ValueObject {
  constructor(
    public readonly version: number,
    public readonly fact: CanonFact,
    public readonly timestamp: Date,
    public readonly reason: string,
  ) {
    super();
    if (version < 1) throw new Error('Version must be >= 1');
    if (reason.trim().length === 0) throw new Error('Version reason cannot be empty');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.version, this.timestamp.getTime()];
  }

  toJSON(): Record<string, unknown> {
    return {
      version: this.version,
      fact: this.fact.toJSON(),
      timestamp: this.timestamp.toISOString(),
      reason: this.reason,
    };
  }
}
