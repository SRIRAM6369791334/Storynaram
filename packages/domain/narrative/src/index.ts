export { NarrativeIdentity } from './narrative-identity.js';

export { NarrativeTitle, Subtitle } from './narrative-title.js';
export { Synopsis, Summary } from './narrative-synopsis.js';
export { Genre, Audience, Language } from './narrative-genre.js';
export type { GenreType, AudienceType, LanguageCode } from './narrative-genre.js';

export { NarrativeStatus } from './narrative-status.js';
export type { NarrativeStatusType } from './narrative-status.js';

export { WordCount, ReadingTime } from './narrative-metrics.js';

export { ChapterNumber, SceneNumber, BeatNumber, DialogueOrder } from './narrative-numbers.js';

export { NarrativeProfile } from './narrative-profile.js';
export type { NarrativeFormat } from './narrative-profile.js';

export { Chapter, ChapterCollection } from './narrative-chapter.js';
export type { ChapterStatus } from './narrative-chapter.js';

export { Scene, SceneCollection } from './narrative-scene.js';
export type { SceneType } from './narrative-scene.js';

export { Beat, BeatCollection } from './narrative-beat.js';
export type { BeatType } from './narrative-beat.js';

export { Dialogue, DialogueCollection } from './narrative-dialogue.js';

export { NarrativeMetadata } from './narrative-metadata.js';
export type { NarrativeMetadataProps } from './narrative-metadata.js';

export { NarrativeStatistics } from './narrative-statistics.js';
export type { NarrativeStatisticsProps } from './narrative-statistics.js';

export { NarrativeAggregate } from './narrative-aggregate.js';

export {
  NarrativeFactory,
} from './narrative-factory.js';
export type {
  CreateNarrativeProps,
  CreateChapterInput,
  CreateSceneInput,
  CreateBeatInput,
  CreateDialogueInput,
} from './narrative-factory.js';

export { NARRATIVE_REPOSITORY } from './narrative-repository.js';
export type { NarrativeRepositoryContract } from './narrative-repository.js';

export { NarrativeDomainService } from './narrative-domain-service.js';

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
} from './narrative-specifications.js';

export {
  NarrativeCreatedEvent,
  ChapterAddedEvent,
  SceneAddedEvent,
  BeatAddedEvent,
  DialogueAddedEvent,
  NarrativePublishedEvent,
  NarrativeArchivedEvent,
} from './narrative-events.js';

export {
  SequentialNumberingRule,
  UniqueChapterNumbersRule,
  ChapterOrderingRule,
} from './business-rules.js';

export { NarrativeDomainModule } from './narrative.module.js';

export {
  indexNarrativeForSearch,
  triggerNarrativeWorkflow,
  handleNarrativeCreatedIntegration,
  handleNarrativePublishedIntegration,
} from './integration.js';
export type { NarrativeRuntimeIntegrations } from './integration.js';
