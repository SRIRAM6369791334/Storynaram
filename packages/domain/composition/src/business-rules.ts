import { BusinessRule, BusinessRuleViolation, Severity } from '@storynaram/domain-kernel';
import { PlotStructure } from './plot.js';
import { ConflictCategory } from './conflict.js';

export class ThreeActStructureRule extends BusinessRule {
  constructor(
    private readonly structure: PlotStructure,
    private readonly pointCount: number,
  ) {
    super();
  }

  get ruleName(): string { return 'ThreeActStructure'; }
  get errorCode(): string { return 'COMPOSITION_THREE_ACT'; }
  get severity(): Severity { return Severity.WARNING; }

  check(): BusinessRuleViolation | null {
    if (this.structure !== 'threeAct') return null;
    if (this.pointCount < 3) {
      return new BusinessRuleViolation(this.ruleName, 'Three-act structure needs at least setup, confrontation, resolution', this.errorCode, this.severity);
    }
    return null;
  }
}

export class FiveActStructureRule extends BusinessRule {
  constructor(
    private readonly structure: PlotStructure,
    private readonly pointCount: number,
  ) {
    super();
  }

  get ruleName(): string { return 'FiveActStructure'; }
  get errorCode(): string { return 'COMPOSITION_FIVE_ACT'; }
  get severity(): Severity { return Severity.WARNING; }

  check(): BusinessRuleViolation | null {
    if (this.structure !== 'fiveAct') return null;
    if (this.pointCount < 5) {
      return new BusinessRuleViolation(this.ruleName, 'Five-act structure needs at least exposition, rising action, climax, falling action, denouement', this.errorCode, this.severity);
    }
    return null;
  }
}

export class ConflictConsistencyRule extends BusinessRule {
  constructor(
    private readonly conflictCategory: ConflictCategory,
    private readonly hasParties: boolean,
  ) {
    super();
  }

  get ruleName(): string { return 'ConflictConsistency'; }
  get errorCode(): string { return 'COMPOSITION_CONFLICT'; }
  get severity(): Severity { return Severity.ERROR; }

  check(): BusinessRuleViolation | null {
    if (this.conflictCategory === 'characterVsCharacter' && !this.hasParties) {
      return new BusinessRuleViolation(this.ruleName, 'Character vs Character conflict needs at least two parties', this.errorCode, this.severity);
    }
    return null;
  }
}

export class ForeshadowPayoffValidationRule extends BusinessRule {
  constructor(
    private readonly foreshadowCount: number,
    private readonly payoffCount: number,
  ) {
    super();
  }

  get ruleName(): string { return 'ForeshadowPayoffValidation'; }
  get errorCode(): string { return 'COMPOSITION_FORESHADOW_PAYOFF'; }
  get severity(): Severity { return Severity.WARNING; }

  check(): BusinessRuleViolation | null {
    if (this.foreshadowCount > 0 && this.payoffCount === 0) {
      return new BusinessRuleViolation(this.ruleName, `${this.foreshadowCount} foreshadow(s) have no payoffs`, this.errorCode, this.severity);
    }
    return null;
  }
}

export class ArcConsistencyRule extends BusinessRule {
  constructor(
    private readonly arcName: string,
    private readonly hasGoal: boolean,
    private readonly hasResolution: boolean,
  ) {
    super();
  }

  get ruleName(): string { return 'ArcConsistency'; }
  get errorCode(): string { return 'COMPOSITION_ARC'; }
  get severity(): Severity { return Severity.WARNING; }

  check(): BusinessRuleViolation | null {
    if (!this.hasGoal) {
      return new BusinessRuleViolation(this.ruleName, `Arc "${this.arcName}" has no goal`, this.errorCode, this.severity);
    }
    if (!this.hasResolution) {
      return new BusinessRuleViolation(this.ruleName, `Arc "${this.arcName}" has no resolution`, this.errorCode, this.severity);
    }
    return null;
  }
}

export class CharacterObjectiveConsistencyRule extends BusinessRule {
  constructor(
    private readonly characterName: string,
    private readonly objectiveCount: number,
  ) {
    super();
  }

  get ruleName(): string { return 'CharacterObjectiveConsistency'; }
  get errorCode(): string { return 'COMPOSITION_CHAR_OBJECTIVE'; }
  get severity(): Severity { return Severity.WARNING; }

  check(): BusinessRuleViolation | null {
    if (this.objectiveCount === 0) {
      return new BusinessRuleViolation(this.ruleName, `Character "${this.characterName}" has no objectives`, this.errorCode, this.severity);
    }
    return null;
  }
}

export class ThemeConsistencyRule extends BusinessRule {
  constructor(
    private readonly themeCount: number,
  ) {
    super();
  }

  get ruleName(): string { return 'ThemeConsistency'; }
  get errorCode(): string { return 'COMPOSITION_THEME'; }
  get severity(): Severity { return Severity.WARNING; }

  check(): BusinessRuleViolation | null {
    if (this.themeCount === 0) {
      return new BusinessRuleViolation(this.ruleName, 'Story has no themes defined', this.errorCode, this.severity);
    }
    return null;
  }
}

export class TimelineConsistencyRule extends BusinessRule {
  constructor(
    private readonly hasTimelineRefs: boolean,
  ) {
    super();
  }

  get ruleName(): string { return 'TimelineConsistency'; }
  get errorCode(): string { return 'COMPOSITION_TIMELINE'; }
  get severity(): Severity { return Severity.WARNING; }

  check(): BusinessRuleViolation | null {
    if (!this.hasTimelineRefs) {
      return new BusinessRuleViolation(this.ruleName, 'Story has no timeline references', this.errorCode, this.severity);
    }
    return null;
  }
}

export class CanonConsistencyRule extends BusinessRule {
  constructor(
    private readonly hasCanonRefs: boolean,
  ) {
    super();
  }

  get ruleName(): string { return 'CanonConsistency'; }
  get errorCode(): string { return 'COMPOSITION_CANON'; }
  get severity(): Severity { return Severity.WARNING; }

  check(): BusinessRuleViolation | null {
    if (!this.hasCanonRefs) {
      return new BusinessRuleViolation(this.ruleName, 'Story has no canon references', this.errorCode, this.severity);
    }
    return null;
  }
}

export class NarrativeConsistencyRule extends BusinessRule {
  constructor(
    private readonly hasNarrativeRefs: boolean,
  ) {
    super();
  }

  get ruleName(): string { return 'NarrativeConsistency'; }
  get errorCode(): string { return 'COMPOSITION_NARRATIVE'; }
  get severity(): Severity { return Severity.WARNING; }

  check(): BusinessRuleViolation | null {
    if (!this.hasNarrativeRefs) {
      return new BusinessRuleViolation(this.ruleName, 'Story has no narrative references', this.errorCode, this.severity);
    }
    return null;
  }
}
