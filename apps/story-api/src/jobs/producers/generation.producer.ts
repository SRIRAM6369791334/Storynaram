import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

export interface EnqueueGenerationParams {
  storyId: string;
  generationId: string;
  userId?: string;
  title?: string;
  chapters?: Array<{ number: number; title: string }>;
  model?: string;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
  priority?: number;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class GenerationProducer {
  private readonly logger = new Logger(GenerationProducer.name);

  constructor(
    @InjectQueue('story-generation') private readonly queue: Queue,
  ) {}

  async enqueueGeneration(params: EnqueueGenerationParams): Promise<string> {
    const { generationId, storyId, priority } = params;
    const job = await this.queue.add(
      'generate',
      {
        generationId,
        storyId,
        userId: params.userId,
        title: params.title,
        chapters: params.chapters,
        model: params.model,
        provider: params.provider,
        temperature: params.temperature,
        maxTokens: params.maxTokens,
        metadata: params.metadata,
        timestamp: new Date().toISOString(),
      },
      {
        jobId: generationId,
        priority: priority ?? 0,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { age: 3600 * 24 },
        removeOnFail: { age: 3600 * 24 },
      },
    );
    this.logger.log(`Enqueued generation job ${job.id} (${generationId}) for story ${storyId}`);
    return generationId;
  }

  async cancelGeneration(generationId: string): Promise<boolean> {
    const job = await this.queue.getJob(generationId);
    if (!job) return false;
    await job.remove();
    this.logger.log(`Cancelled generation job ${generationId}`);
    return true;
  }
}
