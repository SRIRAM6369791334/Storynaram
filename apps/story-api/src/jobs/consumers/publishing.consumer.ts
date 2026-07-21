import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('story-publishing')
export class PublishingConsumer extends WorkerHost {
  private readonly logger = new Logger(PublishingConsumer.name);

  async process(job: Job<{ storyId: string; formats?: string[] }>): Promise<{ status: string }> {
    this.logger.log(`Processing publishing job ${job.id} for story ${job.data.storyId}`);
    return { status: 'completed' };
  }
}
