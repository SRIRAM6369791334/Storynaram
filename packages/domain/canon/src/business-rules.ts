import { BusinessRule, BusinessRuleViolation, Severity, BusinessRuleError } from '@storynaram/domain-kernel';
import { CanonReference } from './canon-reference.js';
import { CanonEntry } from './canon-entry.js';
import { CanonFact } from './canon-fact.js';
import { CanonCollection } from './canon-collection.js';

export class SingleCanonTruthRule extends BusinessRule {
  constructor(
    private readonly key: string,
    private readonly value: unknown,
    private readonly existingEntries: CanonEntry[],
    private readonly newEntryId: string,
  ) {
    super();
  }

  get ruleName(): string { return 'SingleCanonTruth'; }
  get errorCode(): string { return 'CANON_SINGLE_TRUTH'; }
  get severity(): Severity { return Severity.ERROR; }

  check(): BusinessRuleViolation | null {
    for (const existing of this.existingEntries) {
      if (existing.entryId === this.newEntryId) continue;
      const existingValue = existing.currentFact.value;
      if (existingValue !== this.value) {
        return new BusinessRuleViolation(
          this.ruleName,
          `Canon key "${this.key}" already exists with a different value`,
          this.errorCode,
          this.severity,
        );
      }
    }
    return null;
  }
}

export class ConflictDetectionRule extends BusinessRule {
  constructor(
    private readonly key: string,
    private readonly newValue: unknown,
    private readonly newFact: CanonFact,
    private readonly existingFact: CanonFact,
  ) {
    super();
  }

  get ruleName(): string { return 'ConflictDetection'; }
  get errorCode(): string { return 'CANON_CONFLICT_DETECTED'; }
  get severity(): Severity { return Severity.WARNING; }

  check(): BusinessRuleViolation | null {
    if (this.newValue !== this.existingFact.value) {
      return new BusinessRuleViolation(
        this.ruleName,
        `Value conflict for key "${this.key}": new value differs from existing canonical fact`,
        this.errorCode,
        this.severity,
      );
    }
    return null;
  }
}

export class ReferenceValidationRule extends BusinessRule {
  constructor(private readonly references: readonly CanonReference[]) {
    super();
  }

  get ruleName(): string { return 'ReferenceValidation'; }
  get errorCode(): string { return 'CANON_INVALID_REFERENCE'; }
  get severity(): Severity { return Severity.ERROR; }

  check(): BusinessRuleViolation | null {
    for (const ref of this.references) {
      if (ref.domainType.trim().length === 0) {
        return new BusinessRuleViolation(
          this.ruleName,
          'Reference domain type cannot be empty',
          this.errorCode,
          this.severity,
        );
      }
      if (ref.entityId.trim().length === 0) {
        return new BusinessRuleViolation(
          this.ruleName,
          'Reference entity ID cannot be empty',
          this.errorCode,
          this.severity,
        );
      }
    }
    return null;
  }
}

export function assertNoUnresolvedConflicts(entries: CanonCollection): void {
  for (const entry of entries.all) {
    if (entry.hasOpenConflicts()) {
      throw new BusinessRuleError(
        `Entry "${entry.entryId}" has unresolved conflicts and cannot be published`,
      );
    }
  }
}
