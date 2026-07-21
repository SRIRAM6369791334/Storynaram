import type { StoryDraft } from '@storynaram/narrative-execution';

export interface GeneratedChapter {
  number: number;
  title: string;
  content: string;
  wordCount: number;
  model: string;
  provider: string;
  latencyMs: number;
  tokenUsage: { inputTokens: number; outputTokens: number; totalTokens: number };
}

export interface GenerationMetrics {
  totalDurationMs: number;
  totalTokens: number;
  totalCost: number;
  chaptersGenerated: number;
  averageLatencyMs: number;
  modelsUsed: string[];
  providersUsed: string[];
  streamingEnabled: boolean;
  retryCount: number;
}

export class GenerationResult {
  public readonly sessionId: string;
  public readonly storyTitle: string;
  public readonly chapters: GeneratedChapter[];
  public readonly fullStory: string;
  public readonly qualityReport: QualityReport;
  public readonly metrics: GenerationMetrics;
  public readonly completedAt: Date;

  constructor(params: {
    sessionId: string;
    storyTitle: string;
    chapters: GeneratedChapter[];
    fullStory: string;
    qualityReport: QualityReport;
    metrics: GenerationMetrics;
  }) {
    this.sessionId = params.sessionId;
    this.storyTitle = params.storyTitle;
    this.chapters = params.chapters;
    this.fullStory = params.fullStory;
    this.qualityReport = params.qualityReport;
    this.metrics = params.metrics;
    this.completedAt = new Date();
  }
}

export interface QualityReport {
  passed: boolean;
  checks: QualityCheck[];
}

export interface QualityCheck {
  name: string;
  passed: boolean;
  score: number;
  issues: string[];
}

export function estimateTokenCost(totalTokens: number, model: string): number {
  const rates: Record<string, { input: number; output: number }> = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'claude-3-haiku': { input: 0.00025, output: 0.00125 },
    'gemini-pro': { input: 0.00025, output: 0.0005 },
  };

  const rate = rates[model];
  if (!rate) return 0;

  const inputTokens = Math.floor(totalTokens * 0.75);
  const outputTokens = totalTokens - inputTokens;
  return (inputTokens / 1000) * rate.input + (outputTokens / 1000) * rate.output;
}
