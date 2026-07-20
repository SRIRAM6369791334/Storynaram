export enum Severity {
  CRITICAL = 'CRITICAL',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

export class BusinessRuleViolation {
  constructor(
    public readonly ruleName: string,
    public readonly message: string,
    public readonly errorCode: string,
    public readonly severity: Severity = Severity.ERROR,
  ) {}

  toJSON(): Record<string, unknown> {
    return {
      ruleName: this.ruleName,
      message: this.message,
      errorCode: this.errorCode,
      severity: this.severity,
    };
  }
}

export abstract class BusinessRule {
  abstract get ruleName(): string;
  abstract get errorCode(): string;
  abstract get severity(): Severity;
  abstract check(): BusinessRuleViolation | null;

  validate(): BusinessRuleViolation | null {
    return this.check();
  }

  isSatisfied(): boolean {
    return this.check() === null;
  }
}
