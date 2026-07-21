import { ValueObject } from '@storynaram/domain-kernel';

export type RuleType = 'consistency' | 'validation' | 'governance';
export type RuleSeverity = 'error' | 'warning' | 'info';

export class CanonRule extends ValueObject {
  constructor(
    public readonly ruleId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly ruleType: RuleType,
    public readonly severity: RuleSeverity = 'error',
  ) {
    super();
    if (ruleId.trim().length === 0) throw new Error('Rule ID cannot be empty');
    if (name.trim().length === 0) throw new Error('Rule name cannot be empty');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.ruleId, this.ruleType, this.severity];
  }

  toJSON(): Record<string, unknown> {
    return {
      ruleId: this.ruleId,
      name: this.name,
      description: this.description,
      ruleType: this.ruleType,
      severity: this.severity,
    };
  }
}
