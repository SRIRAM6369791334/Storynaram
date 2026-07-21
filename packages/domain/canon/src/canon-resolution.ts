import { ValueObject } from '@storynaram/domain-kernel';

export type ResolutionStrategy = 'use_current' | 'use_conflicting' | 'merge' | 'override';

export class CanonResolution extends ValueObject {
  constructor(
    public readonly strategy: ResolutionStrategy,
    public readonly resolvedValue: unknown,
    public readonly reason: string,
    public readonly resolvedBy: string,
    public readonly resolvedAt: Date = new Date(),
  ) {
    super();
    if (reason.trim().length === 0) throw new Error('Resolution reason cannot be empty');
    if (resolvedBy.trim().length === 0) throw new Error('Resolved by cannot be empty');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.strategy, this.resolvedBy, this.resolvedAt.getTime()];
  }

  toJSON(): Record<string, unknown> {
    return {
      strategy: this.strategy,
      resolvedValue: this.resolvedValue,
      reason: this.reason,
      resolvedBy: this.resolvedBy,
      resolvedAt: this.resolvedAt.toISOString(),
    };
  }
}
