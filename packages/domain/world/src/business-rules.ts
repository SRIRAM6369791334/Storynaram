import { BusinessRule, BusinessRuleViolation, Severity, BusinessRuleError } from '@storynaram/domain-kernel';
import { WorldMap } from './world-map.js';
import { WorldFactions } from './world-faction.js';
import { Calendar } from './world-calendar.js';

export class UniqueWorldNameRule extends BusinessRule {
  constructor(
    private readonly worldName: string,
    private readonly existingNames: Set<string>,
  ) {
    super();
  }

  get ruleName(): string { return 'UniqueWorldName'; }
  get errorCode(): string { return 'WORLD_DUPLICATE_NAME'; }
  get severity(): Severity { return Severity.ERROR; }

  check(): BusinessRuleViolation | null {
    if (this.existingNames.has(this.worldName.toLowerCase())) {
      return new BusinessRuleViolation(
        this.ruleName,
        `World name already exists: ${this.worldName}`,
        this.errorCode,
        this.severity,
      );
    }
    return null;
  }
}

export class RegionHierarchyRule extends BusinessRule {
  constructor(
    private readonly regionId: string,
    private readonly parentRegionId: string | undefined,
    private readonly map: WorldMap,
  ) {
    super();
  }

  get ruleName(): string { return 'RegionHierarchy'; }
  get errorCode(): string { return 'WORLD_INVALID_REGION_HIERARCHY'; }
  get severity(): Severity { return Severity.ERROR; }

  check(): BusinessRuleViolation | null {
    if (this.parentRegionId === undefined) return null;
    if (!this.map.has(this.parentRegionId)) {
      return new BusinessRuleViolation(
        this.ruleName,
        `Parent region not found: ${this.parentRegionId}`,
        this.errorCode,
        this.severity,
      );
    }
    const parent = this.map.get(this.parentRegionId)!;
    const childRegions = this.map.childRegions(this.parentRegionId);
    if (childRegions.some(r => r.id === this.regionId)) {
      return new BusinessRuleViolation(
        this.ruleName,
        `Region already registered under parent: ${this.parentRegionId}`,
        this.errorCode,
        this.severity,
      );
    }
    return null;
  }
}

export class PoliticalConsistencyRule extends BusinessRule {
  constructor(
    private readonly faction: { type: string; influence: number },
    private readonly factions: WorldFactions,
  ) {
    super();
  }

  get ruleName(): string { return 'PoliticalConsistency'; }
  get errorCode(): string { return 'WORLD_POLITICAL_INCONSISTENCY'; }
  get severity(): Severity { return Severity.WARNING; }

  check(): BusinessRuleViolation | null {
    const sameType = this.factions.ofType(this.faction.type as any);
    if (sameType.length > 0 && this.faction.influence > 90) {
      return new BusinessRuleViolation(
        this.ruleName,
        `Multiple influential factions of type ${this.faction.type} may cause conflicts`,
        this.errorCode,
        this.severity,
      );
    }
    return null;
  }
}

export class ClimateConstraintRule extends BusinessRule {
  constructor(
    private readonly biome: string,
    private readonly climate: string,
    private readonly temperature: number,
  ) {
    super();
  }

  get ruleName(): string { return 'ClimateConstraint'; }
  get errorCode(): string { return 'WORLD_CLIMATE_CONSTRAINT'; }
  get severity(): Severity { return Severity.WARNING; }

  check(): BusinessRuleViolation | null {
    const frozenBiomes = ['tundra', 'ice_cap', 'glacier'];
    const hotBiomes = ['desert', 'savanna'];

    if (frozenBiomes.includes(this.biome.toLowerCase()) && this.temperature > 10) {
      return new BusinessRuleViolation(
        this.ruleName,
        `Temperature ${this.temperature}°C is too high for ${this.biome} biome`,
        this.errorCode,
        this.severity,
      );
    }

    if (hotBiomes.includes(this.biome.toLowerCase()) && this.temperature < 20) {
      return new BusinessRuleViolation(
        this.ruleName,
        `Temperature ${this.temperature}°C is too low for ${this.biome} biome`,
        this.errorCode,
        this.severity,
      );
    }

    return null;
  }
}

export class CalendarConsistencyRule extends BusinessRule {
  constructor(
    private readonly months: readonly { name: string; days: number }[],
    private readonly daysInWeek: number,
  ) {
    super();
  }

  get ruleName(): string { return 'CalendarConsistency'; }
  get errorCode(): string { return 'WORLD_CALENDAR_INCONSISTENCY'; }
  get severity(): Severity { return Severity.ERROR; }

  check(): BusinessRuleViolation | null {
    for (const month of this.months) {
      if (month.days < 1) {
        return new BusinessRuleViolation(
          this.ruleName,
          `Month ${month.name} has ${month.days} days, must be at least 1`,
          this.errorCode,
          this.severity,
        );
      }
      if (month.days < this.daysInWeek && month.days > 0) {
        return new BusinessRuleViolation(
          this.ruleName,
          `Month ${month.name} has ${month.days} days, fewer than days in week (${this.daysInWeek})`,
          this.errorCode,
          Severity.WARNING,
        );
      }
    }
    return null;
  }
}

export function assertUniqueWorldName(worldName: string, existing: Set<string>): void {
  const rule = new UniqueWorldNameRule(worldName, existing);
  const violation = rule.check();
  if (violation) {
    throw new BusinessRuleError(violation.message);
  }
}
