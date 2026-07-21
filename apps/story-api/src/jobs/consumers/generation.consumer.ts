import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import { StoryGenerationEngine } from '@storynaram/story-generator';
import { ExecutionResult } from '@storynaram/narrative-execution';
import type { StoryDraft, ChapterDraft, ExecutionReport, ValidationReport } from '@storynaram/narrative-execution';
import { randomUUID } from 'crypto';

interface GenerationJobData {
  storyId: string;
  title?: string;
  chapters?: Array<{ number: number; title: string }>;
  model?: string;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  options?: Record<string, unknown>;
}

@Processor('story-generation')
export class GenerationConsumer extends WorkerHost {
  private readonly logger = new Logger(GenerationConsumer.name);

  constructor(@Inject(StoryGenerationEngine) private readonly engine: StoryGenerationEngine) {
    super();
  }

  async process(job: Job<GenerationJobData>): Promise<{
    status: string;
    sessionId?: string;
    chaptersGenerated?: number;
    totalTokens?: number;
    totalCost?: number;
    error?: string;
  }> {
    const data = job.data;
    this.logger.log(`Processing generation job ${job.id} for story ${data.storyId}`);

    try {
      const chapters: ChapterDraft[] = (data.chapters ?? [{ number: 1, title: 'Chapter 1' }]).map(
        (c) => ({
          number: c.number,
          title: c.title,
          content: '',
          wordCount: 0,
        }),
      );

      const storyDraft: StoryDraft = {
        title: data.title ?? 'Untitled Story',
        chapters,
        characters: [],
        worlds: [],
        timeline: { events: [], overallTimeline: '' },
        narrative: { synopsis: '', chapters: [] },
        composition: { arcs: [], overallStructure: '' },
        validationResults: [],
        metadata: { storyId: data.storyId },
      };

      const executionReport: ExecutionReport = {
        sessionId: randomUUID(),
        status: 'completed',
        stages: [],
        totalDurationMs: 0,
        totalTokens: 0,
        model: data.model ?? 'mock-model',
      };

      const validationReport: ValidationReport = {
        passed: true,
        validations: [],
        summary: '',
      };

      const executionResult = new ExecutionResult({
        sessionId: randomUUID(),
        storyDraft,
        executionReport,
        validationReport,
        statistics: {
          totalTasks: 1,
          completedTasks: 0,
          failedTasks: 0,
          totalDurationMs: 0,
          totalTokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          agentTimings: [],
          stageTimings: [],
        },
      });

      const result = await this.engine.generate(executionResult, {
        model: data.model,
        provider: data.provider,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
        stream: data.stream,
      });

      this.logger.log(`Generation job ${job.id} completed: ${result.metrics.chaptersGenerated} chapters, ${result.metrics.totalTokens} tokens`);

      return {
        status: 'completed',
        sessionId: result.sessionId,
        chaptersGenerated: result.metrics.chaptersGenerated,
        totalTokens: result.metrics.totalTokens,
        totalCost: result.metrics.totalCost,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Generation job ${job.id} failed: ${message}`);
      return {
        status: 'failed',
        error: message,
      };
    }
  }
}
