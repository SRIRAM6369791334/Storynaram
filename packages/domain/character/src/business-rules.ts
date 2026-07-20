import { BusinessRule, BusinessRuleViolation, Severity, BusinessRuleError } from '@storynaram/domain-kernel';
import { CharacterAggregate } from './character-aggregate';

export class UniqueIdentityRule extends BusinessRule {
  constructor(
    private readonly identity: string,
    private readonly existingIds: Set<string>,
  ) {
    super();
  }

  get ruleName(): string { return 'UniqueIdentity'; }
  get errorCode(): string { return 'CHARACTER_DUPLICATE_IDENTITY'; }
  get severity(): Severity { return Severity.ERROR; }

  check(): BusinessRuleViolation | null {
    if (this.existingIds.has(this.identity)) {
      return new BusinessRuleViolation(
        this.ruleName,
        `Character identity already exists: ${this.identity}`,
        this.errorCode,
        this.severity,
      );
    }
    return null;
  }
}

export class AgeValidationRule extends BusinessRule {
  private static readonly MAX_AGE = 1000;

  constructor(private readonly age: number) {
    super();
  }

  get ruleName(): string { return 'AgeValidation'; }
  get errorCode(): string { return 'CHARACTER_INVALID_AGE'; }
  get severity(): Severity { return Severity.ERROR; }

  check(): BusinessRuleViolation | null {
    if (this.age < 0) {
      return new BusinessRuleViolation(
        this.ruleName,
        `Age cannot be negative: ${this.age}`,
        this.errorCode,
        this.severity,
      );
    }
    if (this.age > AgeValidationRule.MAX_AGE) {
      return new BusinessRuleViolation(
        this.ruleName,
        `Age exceeds maximum of ${AgeValidationRule.MAX_AGE}: ${this.age}`,
        this.errorCode,
        this.severity,
      );
    }
    return null;
  }
}

export class SpeciesConstraintRule extends BusinessRule {
  constructor(
    private readonly species: string,
    private readonly validSpecies: Set<string>,
  ) {
    super();
  }

  get ruleName(): string { return 'SpeciesConstraint'; }
  get errorCode(): string { return 'CHARACTER_INVALID_SPECIES'; }
  get severity(): Severity { return Severity.ERROR; }

  check(): BusinessRuleViolation | null {
    if (!this.validSpecies.has(this.species.toLowerCase())) {
      return new BusinessRuleViolation(
        this.ruleName,
        `Invalid species: ${this.species}. Valid: ${Array.from(this.validSpecies).join(', ')}`,
        this.errorCode,
        this.severity,
      );
    }
    return null;
  }
}

export class RelationshipRule extends BusinessRule {
  constructor(
    private readonly character: CharacterAggregate,
    private readonly targetId: string,
    private readonly maxRelationships: number = 100,
  ) {
    super();
  }

  get ruleName(): string { return 'RelationshipRule'; }
  get errorCode(): string { return 'CHARACTER_RELATIONSHIP_LIMIT'; }
  get severity(): Severity { return Severity.WARNING; }

  check(): BusinessRuleViolation | null {
    if (this.character.relationships.count >= this.maxRelationships) {
      return new BusinessRuleViolation(
        this.ruleName,
        `Character has reached maximum of ${this.maxRelationships} relationships`,
        this.errorCode,
        this.severity,
      );
    }
    if (this.character.relationships.all.some(r => r.targetId === this.targetId)) {
      return new BusinessRuleViolation(
        this.ruleName,
        `Relationship with ${this.targetId} already exists`,
        this.errorCode,
        this.severity,
      );
    }
    return null;
  }
}

export class StatusTransitionRule extends BusinessRule {
  constructor(
    private readonly currentStatus: string,
    private readonly newStatus: string,
    private readonly allowedTransitions: Map<string, string[]>,
  ) {
    super();
  }

  get ruleName(): string { return 'StatusTransition'; }
  get errorCode(): string { return 'CHARACTER_INVALID_STATUS_TRANSITION'; }
  get severity(): Severity { return Severity.ERROR; }

  check(): BusinessRuleViolation | null {
    const allowed = this.allowedTransitions.get(this.currentStatus);
    if (!allowed) {
      return new BusinessRuleViolation(
        this.ruleName,
        `No transitions defined from status: ${this.currentStatus}`,
        this.errorCode,
        this.severity,
      );
    }
    if (!allowed.includes(this.newStatus)) {
      return new BusinessRuleViolation(
        this.ruleName,
        `Cannot transition from ${this.currentStatus} to ${this.newStatus}`,
        this.errorCode,
        this.severity,
      );
    }
    return null;
  }
}

export function assertAgeValid(age: number): void {
  const rule = new AgeValidationRule(age);
  const violation = rule.check();
  if (violation) {
    throw new BusinessRuleError(violation.message);
  }
}

export function assertUniqueIdentity(identity: string, existing: Set<string>): void {
  const rule = new UniqueIdentityRule(identity, existing);
  const violation = rule.check();
  if (violation) {
    throw new BusinessRuleError(violation.message);
  }
}
