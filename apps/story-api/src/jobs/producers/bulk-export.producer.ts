import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class BulkExportProducer {
  private readonly logger = new Logger(BulkExportProducer.name);

  constructor(
    @InjectQueue('bulk-export') private readonly queue: Queue,
  ) {}

  async enqueue(storyIds: string[], formats: string[]): Promise<string> {
    const job = await this.queue.add('bulk-export', { storyIds, formats, timestamp: new Date().toISOString() });
    this.logger.log(`Enqueued bulk export job ${job.id} for ${storyIds.length} stories`);
    return job.id ?? '';
  }
}
