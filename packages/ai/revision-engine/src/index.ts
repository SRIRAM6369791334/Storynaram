export { RevisionEngine } from './engine/revision-engine';
export type { EngineHealth, RevisionEngineOptions } from './engine/revision-engine';

export { RevisionSession } from './types/revision-session';
export type { RevisionStatus } from './types/revision-session';

export type { RevisionContext, RevisionOptions, RevisionPassType } from './types/revision-context';

export { RevisionPipeline } from './types/revision-pipeline';
export type { RevisionPipelineStage, RevisionPipelineState } from './types/revision-pipeline';

export { RevisionResult } from './types/revision-result';
export type { RevisedChapter } from './types/revision-result';

export { RevisionStatistics } from './types/revision-statistics';
export type { RevStats } from './types/revision-statistics';

export { RevisionMemory } from './types/revision-memory';
export type { RevisionRecord } from './types/revision-memory';

export type { RevisionCheckpoint, ChapterSnapshot } from './types/revision-checkpoint';
export { createCheckpoint } from './types/revision-checkpoint';

export type { RevisionReport, PassReport, QualityScoreReport, IssueReport, ImprovementReport, DiffReport, DiffEntry, DiffType } from './types/revision-report';

export { RevisionModule } from './module/revision-module';
export type { RevisionModuleOptions } from './module/revision-module';

export { reviseStory, RevisionStartedEvent, RevisionPassCompletedEvent, IssueDetectedEvent, IssueResolvedEvent, QualityImprovedEvent, RevisionCompletedEvent } from './integration';

export { RevisionAgent } from './agents/revision-agent';
export type { RevisionAgentResult } from './agents/revision-agent';
export { GrammarAgent } from './agents/grammar-agent';
export { CharacterReviewAgent } from './agents/character-review-agent';
export { WorldReviewAgent } from './agents/world-review-agent';
export { TimelineReviewAgent } from './agents/timeline-review-agent';
export { CanonReviewAgent } from './agents/canon-review-agent';
export { NarrativeReviewAgent } from './agents/narrative-review-agent';
export { PlotReviewAgent } from './agents/plot-review-agent';
export { StyleReviewAgent } from './agents/style-review-agent';
export { QualityReviewAgent } from './agents/quality-review-agent';

export { StoryQualityScore } from './quality/story-quality-score';
export type { QualityScores, StoryQualityScoreParams } from './quality/story-quality-score';
export { CharacterScore } from './quality/character-score';
export { WorldScore } from './quality/world-score';
export { TimelineScore } from './quality/timeline-score';
export { CanonScore } from './quality/canon-score';
export { NarrativeScore } from './quality/narrative-score';
export { DialogueScore } from './quality/dialogue-score';
export { ReadabilityScore } from './quality/readability-score';
export { EmotionScore } from './quality/emotion-score';
export { ConsistencyScore } from './quality/consistency-score';

export { IssueDetector } from './detection/issue-detector';
export type { DetectIssueParams } from './detection/issue-detector';

export { ImprovementApplier } from './improvement/improvement-applier';
export type { ApplyFixResult } from './improvement/improvement-applier';
