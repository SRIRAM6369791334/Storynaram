import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class PublishingProducer {
  private readonly logger = new Logger(PublishingProducer.name);

  constructor(
    @InjectQueue('story-publishing') private readonly queue: Queue,
  ) {}

  async enqueue(storyId: string, formats?: string[]): Promise<string> {
    const job = await this.queue.add('publish', { storyId, formats, timestamp: new Date().toISOString() });
    this.logger.log(`Enqueued publishing job ${job.id} for story ${storyId}`);
    return job.id ?? '';
  }
}
