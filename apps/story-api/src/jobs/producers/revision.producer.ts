import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class RevisionProducer {
  private readonly logger = new Logger(RevisionProducer.name);

  constructor(
    @InjectQueue('story-revision') private readonly queue: Queue,
  ) {}

  async enqueue(storyId: string, focus?: string[]): Promise<string> {
    const job = await this.queue.add('revise', { storyId, focus, timestamp: new Date().toISOString() });
    this.logger.log(`Enqueued revision job ${job.id} for story ${storyId}`);
    return job.id ?? '';
  }
}
