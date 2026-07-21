import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import { StoryGenerationEngine, GenerationStreamEvent } from '@storynaram/story-generator';
import { GenerationDataLoader } from '../../modules/generation/generation-data-loader';
import { JobsService } from '../jobs.service';

interface GenerationJobData {
  generationId: string;
  storyId: string;
  title?: string;
  chapters?: Array<{ number: number; title: string }>;
  model?: string;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, unknown>;
}

@Processor('story-generation', {
  concurrency: 3,
})
export class GenerationConsumer extends WorkerHost {
  private readonly logger = new Logger(GenerationConsumer.name);

  constructor(
    @Inject(StoryGenerationEngine) private readonly engine: StoryGenerationEngine,
    private readonly dataLoader: GenerationDataLoader,
    private readonly jobsService: JobsService,
  ) {
    super();
  }

  async process(job: Job<GenerationJobData>): Promise<Record<string, unknown>> {
    const data = job.data;
    const generationId = data.generationId;
    this.logger.log(`Processing generation job ${job.id} (${generationId}) for story ${data.storyId}`);

    this.jobsService.updateJob(generationId, { status: 'processing', startedAt: new Date() });

    try {
      const executionResult = await this.dataLoader.load(data.storyId, data.chapters, { model: data.model });

      this.jobsService.updateJob(generationId, { progress: 5 });

      const controller = new AbortController();
      const totalChapters = executionResult.storyDraft.chapters.length;

      this.jobsService.emitStreamEvent({
        type: 'started',
        generationId,
        message: 'Generation started',
      });

      const chapters: Array<Record<string, unknown>> = [];
      let fullStory = '';
      let totalTokenUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
      const qualityChecks: Array<{ name: string; passed: boolean; score: number; issues: string[] }> = [];
      const metricsHolder: { value?: Record<string, unknown> } = {};

      const stream = this.engine.generateStream(
        executionResult,
        {
          model: data.model,
          provider: data.provider,
          temperature: data.temperature,
          maxTokens: data.maxTokens,
        },
        controller.signal,
      );

      for await (const event of stream) {
        await this.handleStreamEvent(event, generationId, chapters, totalChapters, totalTokenUsage, qualityChecks, metricsHolder);
      }

      this.jobsService.updateJob(generationId, { progress: 95 });

      fullStory = chapters.map((ch: Record<string, unknown>) => ch.content as string).join('\n\n');
      const qualityPassed = qualityChecks.every(c => c.passed);

      const resultPayload = {
        status: 'completed',
        chaptersGenerated: chapters.length,
        chapters,
        fullStory,
        qualityPassed,
        metrics: metricsHolder.value ?? {},
      };

      this.jobsService.updateJob(generationId, {
        status: 'completed',
        progress: 100,
        result: resultPayload,
        completedAt: new Date(),
      });

      this.jobsService.emitStreamEvent({
        type: 'done',
        generationId,
        metrics: metricsHolder.value ?? {},
      });

      this.logger.log(`Generation ${generationId} completed: ${chapters.length} chapters`);

      return resultPayload;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Generation ${generationId} failed: ${message}`);

      this.jobsService.updateJob(generationId, {
        status: 'failed',
        failedReason: message,
        completedAt: new Date(),
      });

      this.jobsService.emitStreamEvent({
        type: 'error',
        generationId,
        error: message,
      });

      return { status: 'failed', error: message };
    }
  }

  private async handleStreamEvent(
    event: GenerationStreamEvent,
    generationId: string,
    chapters: Array<Record<string, unknown>>,
    totalChapters: number,
    totalTokenUsage: { inputTokens: number; outputTokens: number; totalTokens: number },
    qualityChecks: Array<{ name: string; passed: boolean; score: number; issues: string[] }>,
    metricsHolder: { value?: Record<string, unknown> },
  ): Promise<void> {
    switch (event.type) {
      case 'chapter:start': {
        chapters.push({ number: event.chapterNumber, title: event.chapterTitle, content: '' });
        const progress = Math.min(10 + Math.round((chapters.length / totalChapters) * 80), 90);
        this.jobsService.updateJob(generationId, { progress });
        this.jobsService.emitStreamEvent({
          type: 'chapter:start',
          generationId,
          chapterNumber: event.chapterNumber,
          chapterTitle: event.chapterTitle,
        });
        break;
      }

      case 'token': {
        if (chapters.length > 0) {
          const currentChapter = chapters[chapters.length - 1]!;
          currentChapter.content = (currentChapter.content as string) + event.delta;
        }
        this.jobsService.emitStreamEvent({
          type: 'token',
          generationId,
          chapterNumber: event.chapterNumber,
          delta: event.delta,
          index: event.index,
          finishReason: event.finishReason,
          latencyMs: event.latencyMs,
          timeToFirstTokenMs: event.timeToFirstTokenMs,
        });
        break;
      }

      case 'chapter:complete': {
        const chapter = chapters.find(c => c.number === event.chapterNumber);
        if (chapter) {
          chapter.content = event.content;
          chapter.tokenUsage = event.tokenUsage;
          chapter.latencyMs = event.latencyMs;
          chapter.wordCount = event.content.split(/\s+/).filter(Boolean).length;
        }
        totalTokenUsage.outputTokens += event.tokenUsage.outputTokens;
        totalTokenUsage.totalTokens += event.tokenUsage.totalTokens;
        this.jobsService.emitStreamEvent({
          type: 'chapter:complete',
          generationId,
          chapterNumber: event.chapterNumber,
          chapterTitle: event.chapterTitle,
          content: event.content,
          tokenUsage: event.tokenUsage,
          latencyMs: event.latencyMs,
          timeToFirstTokenMs: event.timeToFirstTokenMs,
        });
        break;
      }

      case 'quality:check': {
        qualityChecks.push(...event.checks);
        this.jobsService.emitStreamEvent({
          type: 'quality:check',
          generationId,
          checks: event.checks,
        });
        break;
      }

      case 'metrics': {
        metricsHolder.value = event.metrics as unknown as Record<string, unknown>;
        this.jobsService.emitStreamEvent({
          type: 'metrics',
          generationId,
          metrics: event.metrics as unknown as Record<string, unknown>,
        });
        break;
      }

      case 'error': {
        this.jobsService.emitStreamEvent({
          type: 'error',
          generationId,
          error: event.message,
        });
        break;
      }
    }
  }
}
