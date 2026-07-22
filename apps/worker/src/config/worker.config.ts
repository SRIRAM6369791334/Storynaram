import { z } from 'zod';

const workerConfigSchema = z.object({
  redisUrl: z.string().default('redis://localhost:6379'),
  redisPrefix: z.string().default('storynaram'),
  concurrency: z.coerce.number().int().positive().default(5),
  queueName: z.string().default('storynaram-queue'),
});

export type WorkerConfig = z.infer<typeof workerConfigSchema>;

export function createWorkerConfig(overrides?: Partial<WorkerConfig>): WorkerConfig {
  return workerConfigSchema.parse({
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
    redisPrefix: process.env.REDIS_PREFIX ?? 'storynaram',
    concurrency: process.env.CONCURRENCY ?? '5',
    queueName: process.env.QUEUE_NAME ?? 'storynaram-queue',
    ...overrides,
  });
}
