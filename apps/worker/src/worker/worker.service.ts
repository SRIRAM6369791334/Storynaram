import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Worker } from 'bullmq';
import { createWorkerConfig, type WorkerConfig } from '../config/worker.config.js';

export interface JobPayload {
  type: string;
  data: Record<string, unknown>;
}

@Injectable()
export class WorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkerService.name);
  private worker: Worker | null = null;
  private config: WorkerConfig;

  constructor() {
    this.config = createWorkerConfig();
  }

  async onModuleInit(): Promise<void> {
    this.logger.log(`Initializing worker with queue: ${this.config.queueName}`);

    this.worker = new Worker(
      this.config.queueName,
      async (job) => {
        const payload = job.data as JobPayload;
        return this.processJob(payload);
      },
      {
        connection: {
          host: new URL(this.config.redisUrl).hostname,
          port: Number(new URL(this.config.redisUrl).port || '6379'),
        },
        prefix: this.config.redisPrefix,
        concurrency: this.config.concurrency,
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed: ${err.message}`, err.stack);
    });
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Shutting down worker...');
    await this.worker?.close();
  }

  async processJob(payload: JobPayload): Promise<{ success: boolean; result?: string }> {
    this.logger.debug(`Processing job type: ${payload.type}`);
    return { success: true, result: `Processed ${payload.type}` };
  }
}
