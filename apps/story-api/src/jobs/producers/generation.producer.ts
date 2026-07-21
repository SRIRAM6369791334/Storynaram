import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class GenerationProducer {
  private readonly logger = new Logger(GenerationProducer.name);

  constructor(
    @InjectQueue('story-generation') private readonly queue: Queue,
  ) {}

  async enqueue(storyId: string, options?: Record<string, unknown>): Promise<string> {
    const job = await this.queue.add('generate', { storyId, options, timestamp: new Date().toISOString() });
    this.logger.log(`Enqueued generation job ${job.id} for story ${storyId}`);
    return job.id ?? '';
  }
}
