export { StoryIdentity } from './story-identity.js';

export { StoryProfile } from './story-profile.js';
export type { StoryFormat, StoryStatus } from './story-profile.js';

export { StoryMetadata } from './story-metadata.js';
export type { StoryMetadataProps } from './story-metadata.js';

export { StoryStatistics } from './story-statistics.js';
export type { StoryStatisticsProps } from './story-statistics.js';

export { StoryState } from './story-state.js';
export type { StoryPhase } from './story-state.js';

export { StoryVersion } from './story-version.js';

export { Plot, PlotPoint, PlotPointCollection, PlotProgress, PlotStatistics } from './plot.js';
export type { PlotStage, PlotStructure, PlotType } from './plot.js';

export { StoryArc, ArcCollection, ArcGoal, ArcResolution, ArcTransition } from './story-arc.js';
export type { ArcStage, ArcGoalType, ArcResolutionType } from './story-arc.js';

export { CharacterArc, CharacterArcCollection, CharacterGoal, CharacterConflict, CharacterGrowth, CharacterTransformation, CharacterResolution } from './character-arc.js';
export type { CharacterGrowthType, CharacterConflictType } from './character-arc.js';

export { Conflict, ConflictCollection, ConflictResolution } from './conflict.js';
export type { ConflictCategory, ConflictSeverity, ConflictState } from './conflict.js';

export { Theme, ThemeCollection, ThemeProgress, ThemeEvidence, ThemeResolution } from './theme.js';
export type { ThemeCategory } from './theme.js';

export { Foreshadow, ForeshadowCollection, ForeshadowReference, ForeshadowPayoff } from './foreshadow.js';
export type { ForeshadowStrength } from './foreshadow.js';

export { Payoff, PayoffCollection, Resolution, Reward, Consequence } from './payoff.js';

export { StoryObjective, SceneObjective, CharacterObjective, WorldObjective, ObjectiveCollection } from './objectives.js';
export type { ObjectiveStatus, ObjectivePriority } from './objectives.js';

export { StoryAggregate } from './story-aggregate.js';

export { StoryFactory } from './story-factory.js';
export type { CreateStoryProps, CreatePlotPointInput, CreateArcInput, CreateCharacterArcInput, CreateConflictInput, CreateThemeInput, CreateForeshadowInput, CreatePayoffInput } from './story-factory.js';

export { STORY_REPOSITORY } from './story-repository.js';
export type { StoryRepositoryContract } from './story-repository.js';

export { StoryDomainService } from './story-domain-service.js';

export { CompositionEngine } from './composition-engine.js';
export type { CompositionResult } from './composition-engine.js';

export { CompositionValidator } from './composition-validator.js';
export { CompositionAnalyzer } from './composition-analyzer.js';
export type { AnalysisReport } from './composition-analyzer.js';

export { CompositionStatistics } from './composition-statistics.js';

export {
  DraftSpec, PlanningSpec, WritingSpec, CompletedSpec, PublishedSpec,
  StandaloneSpec, SeriesSpec, BranchingSpec, LinearSpec,
} from './story-specifications.js';

export {
  StoryCreatedEvent, PlotCreatedEvent, PlotPointAddedEvent,
  ArcCreatedEvent, CharacterArcCreatedEvent,
  ConflictAddedEvent, ConflictResolvedEvent,
  ThemeAddedEvent, ForeshadowAddedEvent, PayoffResolvedEvent,
  StoryCompletedEvent, StoryPublishedEvent,
} from './story-events.js';

export {
  ThreeActStructureRule, FiveActStructureRule,
  ConflictConsistencyRule, ForeshadowPayoffValidationRule,
  ArcConsistencyRule, CharacterObjectiveConsistencyRule,
  ThemeConsistencyRule, TimelineConsistencyRule,
  CanonConsistencyRule, NarrativeConsistencyRule,
} from './business-rules.js';

export { StoryCompositionDomainModule } from './composition.module.js';

export {
  indexStoryForSearch, triggerStoryWorkflow,
  handleStoryCreatedIntegration, handleStoryPublishedIntegration,
} from './integration.js';
export type { StoryRuntimeIntegrations } from './integration.js';
