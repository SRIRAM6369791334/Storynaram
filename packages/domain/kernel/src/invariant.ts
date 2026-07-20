import { BusinessRuleError } from './errors';

export class Invariant {
  static require(condition: boolean, message: string): asserts condition {
    if (!condition) {
      throw new BusinessRuleError(message);
    }
  }

  static requireNotNull<T>(value: T | null | undefined, message: string): asserts value is T {
    if (value === null || value === undefined) {
      throw new BusinessRuleError(message);
    }
  }

  static requireNotEmpty(value: string, message: string): void {
    if (value.trim().length === 0) {
      throw new BusinessRuleError(message);
    }
  }

  static requireInRange(value: number, min: number, max: number, message: string): void {
    if (value < min || value > max) {
      throw new BusinessRuleError(message);
    }
  }

  static requireMatches(value: string, pattern: RegExp, message: string): void {
    if (!pattern.test(value)) {
      throw new BusinessRuleError(message);
    }
  }
}
