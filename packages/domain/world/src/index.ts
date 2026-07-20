export { WorldIdentity } from './world-identity';

export {
  WorldProfile,
  WorldName,
  WorldDescription,
} from './world-profile';
export type { WorldProfileProps } from './world-profile';

export {
  Coordinates,
  Area,
  Elevation,
  Temperature,
  Population,
  Biome,
  Climate,
  WorldGeography,
} from './world-geography';
export type { WorldGeographyProps } from './world-geography';

export {
  City,
  Village,
  Landmark,
  WorldSettlements,
} from './world-settlements';

export {
  Region,
  PoliticalSystem,
  Kingdom,
  Nation,
} from './world-political';

export { Faction, WorldFactions } from './world-faction';
export type { FactionType } from './world-faction';

export {
  LanguageCode,
  Language,
  CurrencyCode,
  Currency,
  Religion,
  Culture,
  WorldCultures,
} from './world-culture';

export { MagicSystem } from './world-magic-system';
export type { MagicType } from './world-magic-system';

export { TechnologyLevel } from './world-technology-level';
export type { TechEra } from './world-technology-level';

export { Calendar, TimeSystem } from './world-calendar';
export type { CalendarDate, MonthDefinition } from './world-calendar';

export {
  EconomicSystem,
  NaturalResource,
  WorldNaturalResources,
} from './world-economy';
export type { EconomicSystemType, ResourceType, ResourceAbundance } from './world-economy';

export { WorldRule, WorldRules } from './world-rule';
export type { RuleCategory } from './world-rule';

export { WorldEvent, WorldHistory } from './world-history';

export { WorldStatistics } from './world-statistics';
export type { WorldStatisticsProps } from './world-statistics';

export { WorldMap } from './world-map';

export { WorldAggregate } from './world-aggregate';

export {
  WorldFactory,
} from './world-factory';
export type {
  CreateWorldProps,
  CreateWorldProfileInput,
  CreateWorldGeographyInput,
  CreateWorldCalendarInput,
  CreateWorldTimeInput,
} from './world-factory';

export { WORLD_REPOSITORY } from './world-repository';
export type { WorldRepositoryContract } from './world-repository';

export { WorldDomainService } from './world-domain-service';

export {
  FantasySpecification,
  SciFiSpecification,
  HistoricalSpecification,
  ModernSpecification,
  PostApocalypticSpecification,
  OpenWorldSpecification,
  SandboxSpecification,
} from './world-specifications';

export {
  WorldCreatedEvent,
  RegionAddedEvent,
  FactionCreatedEvent,
  MagicSystemChangedEvent,
  CultureUpdatedEvent,
  HistoryRecordedEvent,
  WorldDeletedEvent,
} from './world-events';

export {
  UniqueWorldNameRule,
  RegionHierarchyRule,
  PoliticalConsistencyRule,
  ClimateConstraintRule,
  CalendarConsistencyRule,
  assertUniqueWorldName,
} from './business-rules';

export { WorldDomainModule } from './world.module';

export {
  indexWorldForSearch,
  triggerWorldWorkflow,
  handleWorldCreatedIntegration,
  handleRegionAddedIntegration,
} from './integration';
export type { WorldRuntimeIntegrations } from './integration';
