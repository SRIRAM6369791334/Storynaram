export { NarrativeIdentity } from './narrative-identity';

export { NarrativeTitle, Subtitle } from './narrative-title';
export { Synopsis, Summary } from './narrative-synopsis';
export { Genre, Audience, Language } from './narrative-genre';
export type { GenreType, AudienceType, LanguageCode } from './narrative-genre';

export { NarrativeStatus } from './narrative-status';
export type { NarrativeStatusType } from './narrative-status';

export { WordCount, ReadingTime } from './narrative-metrics';

export { ChapterNumber, SceneNumber, BeatNumber, DialogueOrder } from './narrative-numbers';

export { NarrativeProfile } from './narrative-profile';
export type { NarrativeFormat } from './narrative-profile';

export { Chapter, ChapterCollection } from './narrative-chapter';
export type { ChapterStatus } from './narrative-chapter';

export { Scene, SceneCollection } from './narrative-scene';
export type { SceneType } from './narrative-scene';

export { Beat, BeatCollection } from './narrative-beat';
export type { BeatType } from './narrative-beat';

export { Dialogue, DialogueCollection } from './narrative-dialogue';

export { NarrativeMetadata } from './narrative-metadata';
export type { NarrativeMetadataProps } from './narrative-metadata';

export { NarrativeStatistics } from './narrative-statistics';
export type { NarrativeStatisticsProps } from './narrative-statistics';

export { NarrativeAggregate } from './narrative-aggregate';

export {
  NarrativeFactory,
} from './narrative-factory';
export type {
  CreateNarrativeProps,
  CreateChapterInput,
  CreateSceneInput,
  CreateBeatInput,
  CreateDialogueInput,
} from './narrative-factory';

export { NARRATIVE_REPOSITORY } from './narrative-repository';
export type { NarrativeRepositoryContract } from './narrative-repository';

export { NarrativeDomainService } from './narrative-domain-service';

export {
  PublishedSpec,
  DraftSpec,
  CompletedSpec,
  InProgressSpec,
  NovelSpec,
  ComicSpec,
  ScreenplaySpec,
  InteractiveSpec,
  SeriesSpec,
  StandaloneSpec,
} from './narrative-specifications';

export {
  NarrativeCreatedEvent,
  ChapterAddedEvent,
  SceneAddedEvent,
  BeatAddedEvent,
  DialogueAddedEvent,
  NarrativePublishedEvent,
  NarrativeArchivedEvent,
} from './narrative-events';

export {
  SequentialNumberingRule,
  UniqueChapterNumbersRule,
  ChapterOrderingRule,
} from './business-rules';

export { NarrativeDomainModule } from './narrative.module';

export {
  indexNarrativeForSearch,
  triggerNarrativeWorkflow,
  handleNarrativeCreatedIntegration,
  handleNarrativePublishedIntegration,
} from './integration';
export type { NarrativeRuntimeIntegrations } from './integration';
