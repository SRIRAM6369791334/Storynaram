import { Injectable, Logger } from '@nestjs/common';
import { RedisConnection } from '../connection/redis-connection';
import type { StreamOptions, StreamMessage, StreamConsumerGroupInfo } from '../types';
import { StreamError } from '../errors';

@Injectable()
export class StreamManager {
  private readonly logger = new Logger(StreamManager.name);

  constructor(private readonly connection: RedisConnection) {}

  async add(stream: string, fields: Record<string, string>, options?: StreamOptions): Promise<string> {
    try {
      const client = this.connection.getNativeClient();
      const args: (string | number)[] = [];

      if (options?.maxLen) {
        args.push('MAXLEN', '~', options.maxLen);
      }

      args.push('*');
      for (const [key, value] of Object.entries(fields)) {
        args.push(key, value);
      }

      return client.xadd(stream, ...args) as Promise<string>;
    } catch (err) {
      throw new StreamError(`Failed to add to stream: ${(err as Error).message}`);
    }
  }

  async read(
    streams: string[],
    options?: StreamOptions,
  ): Promise<StreamMessage[]> {
    try {
      const client = this.connection.getNativeClient();
      const count = options?.count ?? 10;
      const blockMs = options?.blockMs;

      if (blockMs !== undefined) {
        const results = await client.xread('COUNT', count, 'BLOCK', blockMs, 'STREAMS', ...streams, ...streams.map(() => '0'));
        return this.parseReadResults(results);
      }

      const results = await client.xread('COUNT', count, 'STREAMS', ...streams, ...streams.map(() => '0'));
      return this.parseReadResults(results);
    } catch (err) {
      throw new StreamError(`Failed to read stream: ${(err as Error).message}`);
    }
  }

  async createGroup(stream: string, group: string, startId = '0'): Promise<void> {
    try {
      const client = this.connection.getNativeClient();
      await client.xgroup('CREATE', stream, group, startId, 'MKSTREAM');
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('BUSYGROUP')) {
        this.logger.warn(`Group ${group} already exists on stream ${stream}`);
        return;
      }
      throw new StreamError(`Failed to create group: ${msg}`);
    }
  }

  async readGroup(
    stream: string,
    group: string,
    consumer: string,
    options?: StreamOptions,
  ): Promise<StreamMessage[]> {
    try {
      const client = this.connection.getNativeClient();
      const count = options?.count ?? 10;
      const blockMs = options?.blockMs;

      if (blockMs !== undefined) {
        const results = await client.xreadgroup('GROUP', group, consumer, 'COUNT', count, 'BLOCK', blockMs, 'STREAMS', stream, '>');
        return this.parseReadGroupResults(results);
      }

      const results = await client.xreadgroup('GROUP', group, consumer, 'COUNT', count, 'STREAMS', stream, '>');
      return this.parseReadGroupResults(results);
    } catch (err) {
      throw new StreamError(`Failed to read group: ${(err as Error).message}`);
    }
  }

  async acknowledge(stream: string, group: string, id: string): Promise<number> {
    try {
      const client = this.connection.getNativeClient();
      return client.xack(stream, group, id);
    } catch (err) {
      throw new StreamError(`Failed to acknowledge: ${(err as Error).message}`);
    }
  }

  async pending(stream: string, group: string, options?: StreamOptions): Promise<StreamMessage[]> {
    try {
      const client = this.connection.getNativeClient();
      const count = options?.count ?? 10;
      const raw = await client.xpending(stream, group, '-', '+', count);
      if (!Array.isArray(raw)) return [];
      return (raw as unknown[][]).map((r: unknown) => {
        const arr = r as unknown[];
        return {
          id: String(arr[0] ?? ''),
          fields: (arr[2] as Record<string, string>) ?? {},
          stream,
        };
      });
    } catch (err) {
      throw new StreamError(`Failed to get pending: ${(err as Error).message}`);
    }
  }

  async claim(
    stream: string,
    group: string,
    consumer: string,
    minIdleTimeMs: number,
    ids: string[],
  ): Promise<StreamMessage[]> {
    try {
      const client = this.connection.getNativeClient();
      const results = await client.xclaim(stream, group, consumer, minIdleTimeMs, ...ids);
      return this.parseClaimResults(results, stream);
    } catch (err) {
      throw new StreamError(`Failed to claim messages: ${(err as Error).message}`);
    }
  }

  async getGroupInfo(stream: string, group: string): Promise<StreamConsumerGroupInfo> {
    try {
      const client = this.connection.getNativeClient();
      const info = await client.xinfo('GROUPS', stream);
      const groups = Array.isArray(info) ? info : [];
      const groupInfo = groups.find((g: unknown[]) => g[1] === group || g[3] === group);
      if (!groupInfo) {
        return { name: group, consumers: 0, pending: 0, lag: 0 };
      }
      const arr = groupInfo as unknown[];
      return {
        name: group,
        consumers: Number(arr[3] ?? 0),
        pending: Number(arr[5] ?? 0),
        lag: Number(arr[7] ?? 0),
      };
    } catch (err) {
      this.logger.error(`Failed to get group info: ${(err as Error).message}`);
      return { name: group, consumers: 0, pending: 0, lag: 0 };
    }
  }

  async trim(stream: string, maxLen: number): Promise<number> {
    try {
      const client = this.connection.getNativeClient();
      return client.xtrim(stream, 'MAXLEN', '~', maxLen);
    } catch (err) {
      this.logger.warn(`Failed to trim stream: ${(err as Error).message}`);
      return 0;
    }
  }

  async deleteMessages(stream: string, ids: string[]): Promise<number> {
    try {
      const client = this.connection.getNativeClient();
      return client.xdel(stream, ...ids);
    } catch (err) {
      this.logger.warn(`Failed to delete messages: ${(err as Error).message}`);
      return 0;
    }
  }

  async getLength(stream: string): Promise<number> {
    try {
      const client = this.connection.getNativeClient();
      return client.xlen(stream);
    } catch {
      return 0;
    }
  }

  async getConsumers(stream: string, group: string): Promise<string[]> {
    try {
      const client = this.connection.getNativeClient();
      const info = await client.xinfo('CONSUMERS', stream, group);
      const consumers = Array.isArray(info) ? info : [];
      return consumers.map((c: unknown[]) => String(c[1] ?? ''));
    } catch {
      return [];
    }
  }

  async deleteConsumer(stream: string, group: string, consumer: string): Promise<number> {
    try {
      const client = this.connection.getNativeClient();
      return client.xgroup('DELCONSUMER', stream, group, consumer) as Promise<number>;
    } catch {
      return 0;
    }
  }

  async destroyGroup(stream: string, group: string): Promise<number> {
    try {
      const client = this.connection.getNativeClient();
      return client.xgroup('DESTROY', stream, group) as Promise<number>;
    } catch {
      return 0;
    }
  }

  private parseReadResults(results: unknown): StreamMessage[] {
    if (!results) return [];
    const streams = results as [string, [string, string[]][]][];
    const messages: StreamMessage[] = [];

    for (const [stream, entries] of streams) {
      for (const [id, fields] of entries) {
        const fieldMap: Record<string, string> = {};
        for (let i = 0; i < fields.length; i += 2) {
          fieldMap[fields[i]!] = fields[i + 1] ?? '';
        }
        messages.push({ id, fields: fieldMap, stream });
      }
    }

    return messages;
  }

  private parseReadGroupResults(results: unknown): StreamMessage[] {
    return this.parseReadResults(results);
  }

  private parseClaimResults(results: unknown, stream: string): StreamMessage[] {
    const entries = results as [string, string[]][];
    if (!Array.isArray(entries)) return [];

    return entries.map(([id, fields]) => {
      const fieldMap: Record<string, string> = {};
      for (let i = 0; i < fields.length; i += 2) {
        fieldMap[fields[i]!] = fields[i + 1] ?? '';
      }
      return { id, fields: fieldMap, stream };
    });
  }
}
