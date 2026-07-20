import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { RedisConnection } from '../connection/redis-connection';
import { QueueError } from '../errors';

export interface QueueMessage<T = unknown> {
  id: string;
  data: T;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface QueueOptions {
  maxRetries?: number;
  visibilityTimeout?: number;
  delaySec?: number;
}

@Injectable()
export class QueueManager {
  private readonly logger = new Logger(QueueManager.name);
  private readonly keyPrefix: string;

  constructor(
    private readonly connection: RedisConnection,
    keyPrefix?: string,
  ) {
    this.keyPrefix = keyPrefix ?? 'queue';
  }

  async enqueue<T>(queue: string, data: T, options?: QueueOptions): Promise<string> {
    const queueKey = this.buildQueueKey(queue);
    const message: QueueMessage<T> = {
      id: uuid(),
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: options?.maxRetries ?? 3,
    };

    try {
      const client = this.connection.getNativeClient();
      const serialized = JSON.stringify(message);

      if (options?.delaySec && options.delaySec > 0) {
        const delayedKey = this.buildDelayedKey(queue);
        await client.zadd(delayedKey, String(Date.now() + options.delaySec * 1000), serialized);
      } else {
        await client.lpush(queueKey, serialized);
      }

      return message.id;
    } catch (err) {
      throw new QueueError(`Failed to enqueue: ${(err as Error).message}`);
    }
  }

  async dequeue<T>(queue: string, options?: QueueOptions): Promise<QueueMessage<T> | null> {
    const queueKey = this.buildQueueKey(queue);
    const processingKey = this.buildProcessingKey(queue);

    try {
      const client = this.connection.getNativeClient();
      const result = await client.brpoplpush(queueKey, processingKey, 0);

      if (!result) return null;

      const message = JSON.parse(result) as QueueMessage<T>;

      if (options?.visibilityTimeout) {
        await client.pexpire(processingKey, options.visibilityTimeout);
      }

      return message;
    } catch (err) {
      throw new QueueError(`Failed to dequeue: ${(err as Error).message}`);
    }
  }

  async dequeueNonBlocking<T>(queue: string): Promise<QueueMessage<T> | null> {
    const queueKey = this.buildQueueKey(queue);
    const processingKey = this.buildProcessingKey(queue);

    try {
      const client = this.connection.getNativeClient();
      const result = await client.rpoplpush(queueKey, processingKey);

      if (!result) return null;

      return JSON.parse(result) as QueueMessage<T>;
    } catch (err) {
      throw new QueueError(`Failed to dequeue non-blocking: ${(err as Error).message}`);
    }
  }

  async acknowledge<T>(queue: string, messageId: string): Promise<boolean> {
    const processingKey = this.buildProcessingKey(queue);

    try {
      const client = this.connection.getNativeClient();
      const messages = await client.lrange(processingKey, 0, -1);

      for (const raw of messages) {
        const msg = JSON.parse(raw) as QueueMessage;
        if (msg.id === messageId) {
          await client.lrem(processingKey, 1, raw);
          return true;
        }
      }

      return false;
    } catch (err) {
      throw new QueueError(`Failed to acknowledge: ${(err as Error).message}`);
    }
  }

  async nack<T>(queue: string, messageId: string): Promise<boolean> {
    const queueKey = this.buildQueueKey(queue);
    const processingKey = this.buildProcessingKey(queue);
    const deadLetterKey = this.buildDeadLetterKey(queue);

    try {
      const client = this.connection.getNativeClient();
      const messages = await client.lrange(processingKey, 0, -1);

      for (const raw of messages) {
        const msg = JSON.parse(raw) as QueueMessage;
        if (msg.id === messageId) {
          await client.lrem(processingKey, 1, raw);
          msg.retryCount++;

          if (msg.retryCount >= msg.maxRetries) {
            await client.lpush(deadLetterKey, JSON.stringify(msg));
            this.logger.warn(`Message ${messageId} moved to DLQ (retries: ${msg.retryCount})`);
          } else {
            await client.lpush(queueKey, JSON.stringify(msg));
          }

          return true;
        }
      }

      return false;
    } catch (err) {
      throw new QueueError(`Failed to nack: ${(err as Error).message}`);
    }
  }

  async getQueueLength(queue: string): Promise<number> {
    const queueKey = this.buildQueueKey(queue);
    try {
      const client = this.connection.getNativeClient();
      return client.llen(queueKey);
    } catch {
      return 0;
    }
  }

  async getProcessingCount(queue: string): Promise<number> {
    const processingKey = this.buildProcessingKey(queue);
    try {
      const client = this.connection.getNativeClient();
      return client.llen(processingKey);
    } catch {
      return 0;
    }
  }

  async getDeadLetterCount(queue: string): Promise<number> {
    const deadLetterKey = this.buildDeadLetterKey(queue);
    try {
      const client = this.connection.getNativeClient();
      return client.llen(deadLetterKey);
    } catch {
      return 0;
    }
  }

  async peek<T>(queue: string): Promise<QueueMessage<T> | null> {
    const queueKey = this.buildQueueKey(queue);
    try {
      const client = this.connection.getNativeClient();
      const result = await client.lindex(queueKey, -1);
      if (!result) return null;
      return JSON.parse(result) as QueueMessage<T>;
    } catch {
      return null;
    }
  }

  async clear(queue: string): Promise<void> {
    const queueKey = this.buildQueueKey(queue);
    const processingKey = this.buildProcessingKey(queue);
    const deadLetterKey = this.buildDeadLetterKey(queue);
    const delayedKey = this.buildDelayedKey(queue);

    try {
      const client = this.connection.getNativeClient();
      await client.del(queueKey, processingKey, deadLetterKey, delayedKey);
    } catch (err) {
      throw new QueueError(`Failed to clear queue: ${(err as Error).message}`);
    }
  }

  async processDelayed(queue: string): Promise<number> {
    const delayedKey = this.buildDelayedKey(queue);
    const queueKey = this.buildQueueKey(queue);

    try {
      const client = this.connection.getNativeClient();
      const now = Date.now();
      const messages = await client.zrangebyscore(delayedKey, '-inf', now);

      if (messages.length === 0) return 0;

      const pipeline = client.pipeline();
      for (const msg of messages) {
        pipeline.lpush(queueKey, msg);
        pipeline.zrem(delayedKey, msg);
      }
      await pipeline.exec();

      return messages.length;
    } catch (err) {
      throw new QueueError(`Failed to process delayed: ${(err as Error).message}`);
    }
  }

  private buildQueueKey(queue: string): string {
    return `${this.keyPrefix}:${queue}:items`;
  }

  private buildProcessingKey(queue: string): string {
    return `${this.keyPrefix}:${queue}:processing`;
  }

  private buildDeadLetterKey(queue: string): string {
    return `${this.keyPrefix}:${queue}:dead-letter`;
  }

  private buildDelayedKey(queue: string): string {
    return `${this.keyPrefix}:${queue}:delayed`;
  }
}
