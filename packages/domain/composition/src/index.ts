export { StoryIdentity } from './story-identity';

export { StoryProfile } from './story-profile';
export type { StoryFormat, StoryStatus } from './story-profile';

export { StoryMetadata } from './story-metadata';
export type { StoryMetadataProps } from './story-metadata';

export { StoryStatistics } from './story-statistics';
export type { StoryStatisticsProps } from './story-statistics';

export { StoryState } from './story-state';
export type { StoryPhase } from './story-state';

export { StoryVersion } from './story-version';

export { Plot, PlotPoint, PlotPointCollection, PlotProgress, PlotStatistics } from './plot';
export type { PlotStage, PlotStructure, PlotType } from './plot';

export { StoryArc, ArcCollection, ArcGoal, ArcResolution, ArcTransition } from './story-arc';
export type { ArcStage, ArcGoalType, ArcResolutionType } from './story-arc';

export { CharacterArc, CharacterArcCollection, CharacterGoal, CharacterConflict, CharacterGrowth, CharacterTransformation, CharacterResolution } from './character-arc';
export type { CharacterGrowthType, CharacterConflictType } from './character-arc';

export { Conflict, ConflictCollection, ConflictResolution } from './conflict';
export type { ConflictCategory, ConflictSeverity, ConflictState } from './conflict';

export { Theme, ThemeCollection, ThemeProgress, ThemeEvidence, ThemeResolution } from './theme';
export type { ThemeCategory } from './theme';

export { Foreshadow, ForeshadowCollection, ForeshadowReference, ForeshadowPayoff } from './foreshadow';
export type { ForeshadowStrength } from './foreshadow';

export { Payoff, PayoffCollection, Resolution, Reward, Consequence } from './payoff';

export { StoryObjective, SceneObjective, CharacterObjective, WorldObjective, ObjectiveCollection } from './objectives';
export type { ObjectiveStatus, ObjectivePriority } from './objectives';

export { StoryAggregate } from './story-aggregate';

export { StoryFactory } from './story-factory';
export type { CreateStoryProps, CreatePlotPointInput, CreateArcInput, CreateCharacterArcInput, CreateConflictInput, CreateThemeInput, CreateForeshadowInput, CreatePayoffInput } from './story-factory';

export { STORY_REPOSITORY } from './story-repository';
export type { StoryRepositoryContract } from './story-repository';

export { StoryDomainService } from './story-domain-service';

export { CompositionEngine } from './composition-engine';
export type { CompositionResult } from './composition-engine';

export { CompositionValidator } from './composition-validator';
export { CompositionAnalyzer } from './composition-analyzer';
export type { AnalysisReport } from './composition-analyzer';

export { CompositionStatistics } from './composition-statistics';

export {
  DraftSpec, PlanningSpec, WritingSpec, CompletedSpec, PublishedSpec,
  StandaloneSpec, SeriesSpec, BranchingSpec, LinearSpec,
} from './story-specifications';

export {
  StoryCreatedEvent, PlotCreatedEvent, PlotPointAddedEvent,
  ArcCreatedEvent, CharacterArcCreatedEvent,
  ConflictAddedEvent, ConflictResolvedEvent,
  ThemeAddedEvent, ForeshadowAddedEvent, PayoffResolvedEvent,
  StoryCompletedEvent, StoryPublishedEvent,
} from './story-events';

export {
  ThreeActStructureRule, FiveActStructureRule,
  ConflictConsistencyRule, ForeshadowPayoffValidationRule,
  ArcConsistencyRule, CharacterObjectiveConsistencyRule,
  ThemeConsistencyRule, TimelineConsistencyRule,
  CanonConsistencyRule, NarrativeConsistencyRule,
} from './business-rules';

export { StoryCompositionDomainModule } from './composition.module';

export {
  indexStoryForSearch, triggerStoryWorkflow,
  handleStoryCreatedIntegration, handleStoryPublishedIntegration,
} from './integration';
export type { StoryRuntimeIntegrations } from './integration';
