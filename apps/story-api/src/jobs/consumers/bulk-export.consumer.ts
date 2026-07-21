import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('bulk-export')
export class BulkExportConsumer extends WorkerHost {
  private readonly logger = new Logger(BulkExportConsumer.name);

  async process(job: Job<{ storyIds: string[]; formats: string[] }>): Promise<{ status: string; exportedCount: number }> {
    this.logger.log(`Processing bulk export job ${job.id} for ${job.data.storyIds.length} stories`);
    return { status: 'completed', exportedCount: job.data.storyIds.length };
  }
}
