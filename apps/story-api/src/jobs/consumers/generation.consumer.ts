import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('story-generation')
export class GenerationConsumer extends WorkerHost {
  private readonly logger = new Logger(GenerationConsumer.name);

  async process(job: Job<{ storyId: string; options?: Record<string, unknown> }>): Promise<{ status: string }> {
    this.logger.log(`Processing generation job ${job.id} for story ${job.data.storyId}`);
    return { status: 'completed' };
  }
}
