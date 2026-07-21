import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('story-revision')
export class RevisionConsumer extends WorkerHost {
  private readonly logger = new Logger(RevisionConsumer.name);

  async process(job: Job<{ storyId: string; focus?: string[] }>): Promise<{ status: string }> {
    this.logger.log(`Processing revision job ${job.id} for story ${job.data.storyId}`);
    return { status: 'completed' };
  }
}
