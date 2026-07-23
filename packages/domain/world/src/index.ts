export { WorldIdentity } from './world-identity.js';

export {
  WorldProfile,
  WorldName,
  WorldDescription,
} from './world-profile.js';
export type { WorldProfileProps } from './world-profile.js';

export {
  Coordinates,
  Area,
  Elevation,
  Temperature,
  Population,
  Biome,
  Climate,
  WorldGeography,
} from './world-geography.js';
export type { WorldGeographyProps } from './world-geography.js';

export {
  City,
  Village,
  Landmark,
  WorldSettlements,
} from './world-settlements.js';

export {
  Region,
  PoliticalSystem,
  Kingdom,
  Nation,
} from './world-political.js';

export { Faction, WorldFactions } from './world-faction.js';
export type { FactionType } from './world-faction.js';

export {
  LanguageCode,
  Language,
  CurrencyCode,
  Currency,
  Religion,
  Culture,
  WorldCultures,
} from './world-culture.js';

export { MagicSystem } from './world-magic-system.js';
export type { MagicType } from './world-magic-system.js';

export { TechnologyLevel } from './world-technology-level.js';
export type { TechEra } from './world-technology-level.js';

export { Calendar, TimeSystem } from './world-calendar.js';
export type { CalendarDate, MonthDefinition } from './world-calendar.js';

export {
  EconomicSystem,
  NaturalResource,
  WorldNaturalResources,
} from './world-economy.js';
export type { EconomicSystemType, ResourceType, ResourceAbundance } from './world-economy.js';

export { WorldRule, WorldRules } from './world-rule.js';
export type { RuleCategory } from './world-rule.js';

export { WorldEvent, WorldHistory } from './world-history.js';

export { WorldStatistics } from './world-statistics.js';
export type { WorldStatisticsProps } from './world-statistics.js';

export { WorldMap } from './world-map.js';

export { WorldAggregate } from './world-aggregate.js';

export {
  WorldFactory,
} from './world-factory.js';
export type {
  CreateWorldProps,
  CreateWorldProfileInput,
  CreateWorldGeographyInput,
  CreateWorldCalendarInput,
  CreateWorldTimeInput,
} from './world-factory.js';

export { WORLD_REPOSITORY } from './world-repository.js';
export type { WorldRepositoryContract } from './world-repository.js';

export { WorldDomainService } from './world-domain-service.js';

export {
  FantasySpecification,
  SciFiSpecification,
  HistoricalSpecification,
  ModernSpecification,
  PostApocalypticSpecification,
  OpenWorldSpecification,
  SandboxSpecification,
} from './world-specifications.js';

export {
  WorldCreatedEvent,
  RegionAddedEvent,
  FactionCreatedEvent,
  MagicSystemChangedEvent,
  CultureUpdatedEvent,
  HistoryRecordedEvent,
  WorldDeletedEvent,
} from './world-events.js';

export {
  UniqueWorldNameRule,
  RegionHierarchyRule,
  PoliticalConsistencyRule,
  ClimateConstraintRule,
  CalendarConsistencyRule,
  assertUniqueWorldName,
} from './business-rules.js';

export { WorldDomainModule } from './world.module.js';

export {
  indexWorldForSearch,
  triggerWorldWorkflow,
  handleWorldCreatedIntegration,
  handleRegionAddedIntegration,
} from './integration.js';
export type { WorldRuntimeIntegrations } from './integration.js';
