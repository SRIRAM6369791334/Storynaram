import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import { StoryGenerationEngine } from '@storynaram/story-generator';
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
  timeout: 30 * 60 * 1000,
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

      this.jobsService.updateJob(generationId, { progress: 10 });

      const result = await this.engine.generate(executionResult, {
        model: data.model,
        provider: data.provider,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
      });

      this.jobsService.updateJob(generationId, { progress: 90 });

      const chapters = result.chapters.map((ch) => ({
        number: ch.number,
        title: ch.title,
        content: ch.content,
        wordCount: ch.wordCount,
        model: ch.model,
        provider: ch.provider,
        latencyMs: ch.latencyMs,
      }));

      const resultPayload = {
        status: 'completed',
        sessionId: result.sessionId,
        chaptersGenerated: result.metrics.chaptersGenerated,
        totalTokens: result.metrics.totalTokens,
        totalCost: result.metrics.totalCost,
        chapters,
        fullStory: result.fullStory,
        qualityPassed: result.qualityReport.passed,
        metrics: result.metrics,
      };

      this.jobsService.updateJob(generationId, {
        status: 'completed',
        progress: 100,
        result: resultPayload,
        completedAt: new Date(),
      });

      this.logger.log(`Generation ${generationId} completed: ${result.metrics.chaptersGenerated} chapters, ${result.metrics.totalTokens} tokens`);

      return resultPayload;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Generation ${generationId} failed: ${message}`);

      this.jobsService.updateJob(generationId, {
        status: 'failed',
        failedReason: message,
        completedAt: new Date(),
      });

      return { status: 'failed', error: message };
    }
  }
}
