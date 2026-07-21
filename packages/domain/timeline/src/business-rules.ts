import { BusinessRule, BusinessRuleViolation, Severity, BusinessRuleError } from '@storynaram/domain-kernel';
import { TimelineDate } from './timeline-date';
import { TimelineEvents } from './timeline-event';
import { TimelineBranch } from './timeline-branch';

export class ChronologicalOrderRule extends BusinessRule {
  constructor(
    private readonly eventDate: TimelineDate,
    private readonly branchId: string,
    private readonly events: TimelineEvents,
  ) {
    super();
  }

  get ruleName(): string { return 'ChronologicalOrder'; }
  get errorCode(): string { return 'TIMELINE_CHRONOLOGICAL_ORDER'; }
  get severity(): Severity { return Severity.ERROR; }

  check(): BusinessRuleViolation | null {
    const branchEvents = this.events.inBranch(this.branchId);
    const lastEvent = branchEvents[branchEvents.length - 1];
    if (lastEvent && this.eventDate.isBefore(lastEvent.date)) {
      return new BusinessRuleViolation(
        this.ruleName,
        `Event date ${this.eventDate.toJSON()} is before last event date ${lastEvent.date.toJSON()} in branch ${this.branchId}`,
        this.errorCode,
        this.severity,
      );
    }
    return null;
  }
}

export class ValidDateRule extends BusinessRule {
  private static readonly MAX_YEAR = 9999;
  private static readonly MIN_YEAR = -9999;

  constructor(private readonly date: TimelineDate) {
    super();
  }

  get ruleName(): string { return 'ValidDate'; }
  get errorCode(): string { return 'TIMELINE_INVALID_DATE'; }
  get severity(): Severity { return Severity.ERROR; }

  check(): BusinessRuleViolation | null {
    if (this.date.year < ValidDateRule.MIN_YEAR || this.date.year > ValidDateRule.MAX_YEAR) {
      return new BusinessRuleViolation(
        this.ruleName,
        `Year ${this.date.year} out of range [${ValidDateRule.MIN_YEAR}, ${ValidDateRule.MAX_YEAR}]`,
        this.errorCode,
        this.severity,
      );
    }
    return null;
  }
}

export class BranchConsistencyRule extends BusinessRule {
  constructor(
    private readonly branchId: string,
    private readonly branches: { get(id: string): TimelineBranch | undefined; has(id: string): boolean },
  ) {
    super();
  }

  get ruleName(): string { return 'BranchConsistency'; }
  get errorCode(): string { return 'TIMELINE_BRANCH_CONSISTENCY'; }
  get severity(): Severity { return Severity.ERROR; }

  check(): BusinessRuleViolation | null {
    if (!this.branches.has(this.branchId)) {
      return new BusinessRuleViolation(
        this.ruleName,
        `Branch does not exist: ${this.branchId}`,
        this.errorCode,
        this.severity,
      );
    }
    return null;
  }
}

export class CausalityValidationRule extends BusinessRule {
  constructor(
    private readonly causeIds: string[],
    private readonly effectDate: TimelineDate,
    private readonly events: TimelineEvents,
  ) {
    super();
  }

  get ruleName(): string { return 'CausalityValidation'; }
  get errorCode(): string { return 'TIMELINE_CAUSALITY_ERROR'; }
  get severity(): Severity { return Severity.WARNING; }

  check(): BusinessRuleViolation | null {
    for (const causeId of this.causeIds) {
      const causeEvent = this.events.get(causeId);
      if (causeEvent && causeEvent.date.isAfter(this.effectDate)) {
        return new BusinessRuleViolation(
          this.ruleName,
          `Cause event ${causeId} (${causeEvent.date.toJSON()}) occurs after effect event`,
          this.errorCode,
          this.severity,
        );
      }
    }
    return null;
  }
}

export class CircularDependencyRule extends BusinessRule {
  constructor(
    private readonly eventId: string,
    private readonly causeIds: string[],
    private readonly events: TimelineEvents,
  ) {
    super();
  }

  get ruleName(): string { return 'CircularDependency'; }
  get errorCode(): string { return 'TIMELINE_CIRCULAR_DEPENDENCY'; }
  get severity(): Severity { return Severity.ERROR; }

  check(): BusinessRuleViolation | null {
    for (const causeId of this.causeIds) {
      if (this.hasCircularDependency(causeId, this.eventId, new Set())) {
        return new BusinessRuleViolation(
          this.ruleName,
          `Adding cause ${causeId} would create circular dependency with ${this.eventId}`,
          this.errorCode,
          this.severity,
        );
      }
    }
    return null;
  }

  private hasCircularDependency(currentId: string, targetId: string, visited: Set<string>): boolean {
    if (currentId === targetId) return true;
    if (visited.has(currentId)) return false;
    visited.add(currentId);
    const event = this.events.get(currentId);
    if (!event) return false;
    for (const consequenceId of event.consequenceEventIds) {
      if (this.hasCircularDependency(consequenceId, targetId, visited)) return true;
    }
    return false;
  }
}

export class ParentBranchRule extends BusinessRule {
  constructor(
    private readonly parentBranchId: string | undefined,
    private readonly branches: { get(id: string): TimelineBranch | undefined },
  ) {
    super();
  }

  get ruleName(): string { return 'ParentBranch'; }
  get errorCode(): string { return 'TIMELINE_PARENT_BRANCH'; }
  get severity(): Severity { return Severity.ERROR; }

  check(): BusinessRuleViolation | null {
    if (this.parentBranchId === undefined) return null;
    if (!this.branches.get(this.parentBranchId)) {
      return new BusinessRuleViolation(
        this.ruleName,
        `Parent branch does not exist: ${this.parentBranchId}`,
        this.errorCode,
        this.severity,
      );
    }
    return null;
  }
}

export function assertValidEventDate(date: TimelineDate): void {
  const rule = new ValidDateRule(date);
  const violation = rule.check();
  if (violation) throw new BusinessRuleError(violation.message);
}
