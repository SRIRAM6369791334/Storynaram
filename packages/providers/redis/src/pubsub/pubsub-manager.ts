import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable, filter, map } from 'rxjs';
import Redis from 'ioredis';
import { RedisConnection } from '../connection/redis-connection';
import type { PubSubEvent } from '../types';
import { PubSubError } from '../errors';

@Injectable()
export class PubSubManager {
  private readonly logger = new Logger(PubSubManager.name);
  private readonly subject = new Subject<PubSubEvent>();
  private subscriber: Redis | null = null;
  private subscribed = false;
  private readonly channels = new Set<string>();
  private readonly patterns = new Set<string>();

  constructor(private readonly connection: RedisConnection) {}

  async initialize(): Promise<void> {
    try {
      const client = this.connection.getNativeClient();
      this.subscriber = client.duplicate();

      this.subscriber.on('message', (channel: string, message: string) => {
        this.handleMessage(channel, message);
      });

      this.subscriber.on('pmessage', (pattern: string, channel: string, message: string) => {
        this.handlePatternMessage(pattern, channel, message);
      });

      this.subscriber.on('error', (err: Error) => {
        this.logger.error(`Subscriber error: ${err.message}`);
      });

      this.subscribed = true;
      this.logger.log('PubSub subscriber initialized');
    } catch (err) {
      throw new PubSubError(`Failed to initialize PubSub: ${(err as Error).message}`);
    }
  }

  async publish<T>(channel: string, data: T): Promise<number> {
    try {
      const serialized = this.serialize(data);
      const client = this.connection.getNativeClient();
      const count = await client.publish(channel, serialized);
      return count;
    } catch (err) {
      throw new PubSubError(`Failed to publish: ${(err as Error).message}`);
    }
  }

  async subscribe(channel: string): Promise<void> {
    if (!this.subscriber) {
      throw new PubSubError('PubSub not initialized. Call initialize() first.');
    }
    try {
      await this.subscriber.subscribe(channel);
      this.channels.add(channel);
      this.logger.log(`Subscribed to channel: ${channel}`);
    } catch (err) {
      throw new PubSubError(`Failed to subscribe: ${(err as Error).message}`);
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    if (!this.subscriber) return;
    try {
      await this.subscriber.unsubscribe(channel);
      this.channels.delete(channel);
      this.logger.log(`Unsubscribed from channel: ${channel}`);
    } catch (err) {
      throw new PubSubError(`Failed to unsubscribe: ${(err as Error).message}`);
    }
  }

  async psubscribe(pattern: string): Promise<void> {
    if (!this.subscriber) {
      throw new PubSubError('PubSub not initialized. Call initialize() first.');
    }
    try {
      await this.subscriber.psubscribe(pattern);
      this.patterns.add(pattern);
      this.logger.log(`Subscribed to pattern: ${pattern}`);
    } catch (err) {
      throw new PubSubError(`Failed to psubscribe: ${(err as Error).message}`);
    }
  }

  async punsubscribe(pattern: string): Promise<void> {
    if (!this.subscriber) return;
    try {
      await this.subscriber.punsubscribe(pattern);
      this.patterns.delete(pattern);
      this.logger.log(`Unsubscribed from pattern: ${pattern}`);
    } catch (err) {
      throw new PubSubError(`Failed to punsubscribe: ${(err as Error).message}`);
    }
  }

  on<T = unknown>(channel: string): Observable<PubSubEvent<T>> {
    return this.subject.pipe(
      filter((event: PubSubEvent) => event.channel === channel && !event.pattern),
      map((event: PubSubEvent) => event as PubSubEvent<T>),
    );
  }

  onPattern<T = unknown>(pattern: string): Observable<PubSubEvent<T>> {
    return this.subject.pipe(
      filter((event: PubSubEvent) => event.pattern === pattern),
      map((event: PubSubEvent) => event as PubSubEvent<T>),
    );
  }

  onAny<T = unknown>(): Observable<PubSubEvent<T>> {
    return this.subject.pipe(map((event: PubSubEvent) => event as PubSubEvent<T>));
  }

  getSubscribedChannels(): string[] {
    return [...this.channels];
  }

  getSubscribedPatterns(): string[] {
    return [...this.patterns];
  }

  isSubscribed(): boolean {
    return this.subscribed;
  }

  async close(): Promise<void> {
    if (this.subscriber) {
      try {
        if (this.channels.size > 0) {
          await this.subscriber.unsubscribe(...this.channels);
        }
        if (this.patterns.size > 0) {
          await this.subscriber.punsubscribe(...this.patterns);
        }
        await this.subscriber.quit();
      } catch (err) {
        this.logger.error(`Error closing subscriber: ${(err as Error).message}`);
      }
      this.subscriber = null;
      this.subscribed = false;
      this.channels.clear();
      this.patterns.clear();
      this.logger.log('PubSub subscriber closed');
    }
    this.subject.complete();
  }

  private handleMessage(channel: string, message: string): void {
    try {
      const data = this.deserialize(message);
      this.subject.next({
        channel,
        data,
        timestamp: Date.now(),
      });
    } catch (err) {
      this.logger.error(`Failed to handle message on ${channel}: ${(err as Error).message}`);
    }
  }

  private handlePatternMessage(pattern: string, channel: string, message: string): void {
    try {
      const data = this.deserialize(message);
      this.subject.next({
        channel,
        pattern,
        data,
        timestamp: Date.now(),
      });
    } catch (err) {
      this.logger.error(`Failed to handle pattern message on ${channel}: ${(err as Error).message}`);
    }
  }

  private serialize<T>(data: T): string {
    return JSON.stringify(data);
  }

  private deserialize<T>(raw: string): T {
    return JSON.parse(raw) as T;
  }
}
