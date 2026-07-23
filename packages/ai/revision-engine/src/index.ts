export { RevisionEngine } from './engine/revision-engine.js';
export type { EngineHealth, RevisionEngineOptions } from './engine/revision-engine.js';

export { RevisionSession } from './types/revision-session.js';
export type { RevisionStatus } from './types/revision-session.js';

export type { RevisionContext, RevisionOptions, RevisionPassType } from './types/revision-context.js';

export { RevisionPipeline } from './types/revision-pipeline.js';
export type { RevisionPipelineStage, RevisionPipelineState } from './types/revision-pipeline.js';

export { RevisionResult } from './types/revision-result.js';
export type { RevisedChapter } from './types/revision-result.js';

export { RevisionStatistics } from './types/revision-statistics.js';
export type { RevStats } from './types/revision-statistics.js';

export { RevisionMemory } from './types/revision-memory.js';
export type { RevisionRecord } from './types/revision-memory.js';

export type { RevisionCheckpoint, ChapterSnapshot } from './types/revision-checkpoint.js';
export { createCheckpoint } from './types/revision-checkpoint.js';

export type { RevisionReport, PassReport, QualityScoreReport, IssueReport, ImprovementReport, DiffReport, DiffEntry, DiffType } from './types/revision-report.js';

export { RevisionModule } from './module/revision-module.js';
export type { RevisionModuleOptions } from './module/revision-module.js';

export { reviseStory, RevisionStartedEvent, RevisionPassCompletedEvent, IssueDetectedEvent, IssueResolvedEvent, QualityImprovedEvent, RevisionCompletedEvent } from './integration.js';

export { RevisionAgent } from './agents/revision-agent.js';
export type { RevisionAgentResult } from './agents/revision-agent.js';
export { GrammarAgent } from './agents/grammar-agent.js';
export { CharacterReviewAgent } from './agents/character-review-agent.js';
export { WorldReviewAgent } from './agents/world-review-agent.js';
export { TimelineReviewAgent } from './agents/timeline-review-agent.js';
export { CanonReviewAgent } from './agents/canon-review-agent.js';
export { NarrativeReviewAgent } from './agents/narrative-review-agent.js';
export { PlotReviewAgent } from './agents/plot-review-agent.js';
export { StyleReviewAgent } from './agents/style-review-agent.js';
export { QualityReviewAgent } from './agents/quality-review-agent.js';

export { StoryQualityScore } from './quality/story-quality-score.js';
export type { QualityScores, StoryQualityScoreParams } from './quality/story-quality-score.js';
export { CharacterScore } from './quality/character-score.js';
export { WorldScore } from './quality/world-score.js';
export { TimelineScore } from './quality/timeline-score.js';
export { CanonScore } from './quality/canon-score.js';
export { NarrativeScore } from './quality/narrative-score.js';
export { DialogueScore } from './quality/dialogue-score.js';
export { ReadabilityScore } from './quality/readability-score.js';
export { EmotionScore } from './quality/emotion-score.js';
export { ConsistencyScore } from './quality/consistency-score.js';

export { IssueDetector } from './detection/issue-detector.js';
export type { DetectIssueParams } from './detection/issue-detector.js';

export { ImprovementApplier } from './improvement/improvement-applier.js';
export type { ApplyFixResult } from './improvement/improvement-applier.js';
