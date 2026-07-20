import { describe, it, expect } from 'vitest';
import { BusinessRule, BusinessRuleViolation, Severity } from '../src/business-rule';

class MaxLengthRule extends BusinessRule {
  constructor(
    private readonly value: string,
    private readonly max: number,
  ) {
    super();
  }

  get ruleName(): string {
    return 'MaxLength';
  }

  get errorCode(): string {
    return 'MAX_LENGTH_EXCEEDED';
  }

  get severity(): Severity {
    return Severity.ERROR;
  }

  check(): BusinessRuleViolation | null {
    if (this.value.length > this.max) {
      return new BusinessRuleViolation(
        this.ruleName,
        `Value exceeds max length of ${this.max}`,
        this.errorCode,
        this.severity,
      );
    }
    return null;
  }
}

class RequiredRule extends BusinessRule {
  constructor(private readonly value: string | null | undefined) {
    super();
  }

  get ruleName(): string {
    return 'Required';
  }

  get errorCode(): string {
    return 'REQUIRED_FIELD';
  }

  get severity(): Severity {
    return Severity.CRITICAL;
  }

  check(): BusinessRuleViolation | null {
    if (this.value === null || this.value === undefined || this.value === '') {
      return new BusinessRuleViolation(
        this.ruleName,
        'Value is required',
        this.errorCode,
        this.severity,
      );
    }
    return null;
  }
}

describe('BusinessRule', () => {
  it('passes when condition is met', () => {
    const rule = new MaxLengthRule('short', 10);
    expect(rule.check()).toBeNull();
  });

  it('fails when condition is violated', () => {
    const rule = new MaxLengthRule('this is too long', 5);
    const violation = rule.check();
    expect(violation).not.toBeNull();
    expect(violation!.ruleName).toBe('MaxLength');
    expect(violation!.errorCode).toBe('MAX_LENGTH_EXCEEDED');
  });

  it('validate returns violation', () => {
    const rule = new MaxLengthRule('too long', 3);
    const violation = rule.validate();
    expect(violation).not.toBeNull();
  });

  it('validate returns null when satisfied', () => {
    const rule = new MaxLengthRule('ok', 10);
    expect(rule.validate()).toBeNull();
  });

  it('isSatisfied returns true when rule passes', () => {
    const rule = new MaxLengthRule('ok', 10);
    expect(rule.isSatisfied()).toBe(true);
  });

  it('isSatisfied returns false when rule fails', () => {
    const rule = new MaxLengthRule('too long', 3);
    expect(rule.isSatisfied()).toBe(false);
  });

  it('various severity levels', () => {
    const required = new RequiredRule(null);
    const violation = required.check();
    expect(violation!.severity).toBe(Severity.CRITICAL);
  });

  it('violation toJSON returns correct shape', () => {
    const rule = new MaxLengthRule('too long', 3);
    const violation = rule.check()!;
    const json = violation.toJSON();
    expect(json.ruleName).toBe('MaxLength');
    expect(json.errorCode).toBe('MAX_LENGTH_EXCEEDED');
    expect(json.severity).toBe('ERROR');
  });
});
