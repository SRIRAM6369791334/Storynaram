import type { StoryDraft, ChapterDraft } from '@storynaram/narrative-execution';
import type { GenerationResult } from './generation-result';

export interface PipelineStage {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;
  error?: string;
}

export interface ChapterGeneration {
  chapterNumber: number;
  chapterTitle: string;
  prompt: string;
  optimizedPrompt: string;
  selectedModel: string;
  selectedProvider: string;
  generatedContent: string;
  tokenUsage: { inputTokens: number; outputTokens: number; totalTokens: number };
  latencyMs: number;
  qualityScore?: number;
}

export interface GenerationPipelineState {
  stages: PipelineStage[];
  chapters: ChapterGeneration[];
  currentChapterIndex: number;
  totalTokens: { inputTokens: number; outputTokens: number; totalTokens: number };
  totalDurationMs: number;
}

export class GenerationPipeline {
  public state: GenerationPipelineState;

  constructor() {
    this.state = {
      stages: [],
      chapters: [],
      currentChapterIndex: 0,
      totalTokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      totalDurationMs: 0,
    };
  }

  addStage(name: string): void {
    this.state.stages.push({ name, status: 'pending' });
  }

  startStage(name: string): void {
    const stage = this.state.stages.find(s => s.name === name);
    if (stage) {
      stage.status = 'running';
      stage.startedAt = new Date();
    }
  }

  completeStage(name: string): void {
    const stage = this.state.stages.find(s => s.name === name);
    if (stage) {
      stage.status = 'completed';
      stage.completedAt = new Date();
      stage.durationMs = stage.startedAt ? Date.now() - stage.startedAt.getTime() : 0;
    }
  }

  failStage(name: string, error: string): void {
    const stage = this.state.stages.find(s => s.name === name);
    if (stage) {
      stage.status = 'failed';
      stage.error = error;
      stage.completedAt = new Date();
    }
  }

  addChapter(chapter: ChapterGeneration): void {
    this.state.chapters.push(chapter);
    this.state.totalTokens.inputTokens += chapter.tokenUsage.inputTokens;
    this.state.totalTokens.outputTokens += chapter.tokenUsage.outputTokens;
    this.state.totalTokens.totalTokens += chapter.tokenUsage.totalTokens;
    this.state.totalDurationMs += chapter.latencyMs;
    this.state.currentChapterIndex++;
  }

  getStage(name: string): PipelineStage | undefined {
    return this.state.stages.find(s => s.name === name);
  }

  isComplete(): boolean {
    return this.state.stages.every(s => s.status === 'completed' || s.status === 'skipped');
  }

  hasFailed(): boolean {
    return this.state.stages.some(s => s.status === 'failed');
  }
}
