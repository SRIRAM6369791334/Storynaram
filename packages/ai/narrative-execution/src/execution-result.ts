import type { ExecutionStats } from './execution-statistics';

export interface StoryDraft {
  title: string;
  chapters: ChapterDraft[];
  characters: CharacterProse[];
  worlds: WorldProse[];
  timeline: TimelineProse;
  narrative: NarrativeProse;
  composition: CompositionProse;
  validationResults: ValidationResult[];
  metadata: Record<string, unknown>;
}

export interface ChapterDraft {
  number: number;
  title: string;
  content: string;
  wordCount: number;
}

export interface CharacterProse {
  name: string;
  role: string;
  introduction: string;
  dialogue: string;
  scenes: string[];
}

export interface WorldProse {
  name: string;
  regions: string[];
  description: string;
}

export interface TimelineProse {
  events: Array<{ date: string; title: string; narrative: string }>;
  overallTimeline: string;
}

export interface NarrativeProse {
  synopsis: string;
  chapters: ChapterDraft[];
}

export interface CompositionProse {
  arcs: Array<{ name: string; content: string }>;
  overallStructure: string;
}

export interface ValidationResult {
  validator: string;
  passed: boolean;
  issues: string[];
  details?: string;
}

export class ExecutionResult {
  public readonly sessionId: string;
  public readonly storyDraft: StoryDraft;
  public readonly executionReport: ExecutionReport;
  public readonly validationReport: ValidationReport;
  public readonly statistics: ExecutionStats;
  public readonly completedAt: Date;

  constructor(params: {
    sessionId: string;
    storyDraft: StoryDraft;
    executionReport: ExecutionReport;
    validationReport: ValidationReport;
    statistics: ExecutionStats;
  }) {
    this.sessionId = params.sessionId;
    this.storyDraft = params.storyDraft;
    this.executionReport = params.executionReport;
    this.validationReport = params.validationReport;
    this.statistics = params.statistics;
    this.completedAt = new Date();
  }
}

export interface ExecutionReport {
  sessionId: string;
  status: string;
  stages: StageReport[];
  totalDurationMs: number;
  totalTokens: number;
  model: string;
}

export interface StageReport {
  name: string;
  status: 'completed' | 'failed' | 'skipped';
  durationMs: number;
  agentId?: string;
  error?: string;
  tokenUsage?: { inputTokens: number; outputTokens: number; totalTokens: number };
}

export interface ValidationReport {
  passed: boolean;
  validations: ValidationResult[];
  summary: string;
}
