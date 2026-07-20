import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import Redis, { Cluster } from 'ioredis';
import type { RedisConnectionOptions } from '../types';
import type { ClusterHealth } from '../types';
import { ConnectionError, QueryError } from '../errors';
import { REDIS_MODULE_OPTIONS } from '../tokens';

@Injectable()
export class RedisConnection {
  private readonly logger = new Logger(RedisConnection.name);
  private client: Redis | Cluster | null = null;
  private isClusterMode = false;
  private connected = false;
  private readonly slowQueryThresholdMs: number;

  constructor(
    @Optional() @Inject(REDIS_MODULE_OPTIONS)
    private readonly moduleOptions?: { slowQueryThresholdMs?: number },
  ) {
    this.slowQueryThresholdMs = moduleOptions?.slowQueryThresholdMs ?? 500;
  }

  async initialize(options: RedisConnectionOptions): Promise<void> {
    try {
      if (options.cluster) {
        this.isClusterMode = true;
        const nodes = options.nodes ?? [{ host: options.host ?? 'localhost', port: options.port ?? 6379 }];
        this.client = new Cluster(nodes, {
          redisOptions: {
            password: options.password,
            db: options.db,
            tls: options.tls ? {} : undefined,
            keyPrefix: options.keyPrefix,
            enableAutoPipelining: options.enableAutoPipelining,
            maxRetriesPerRequest: options.maxRetriesPerRequest,
            connectTimeout: options.connectTimeout ?? 10000,
            lazyConnect: options.lazyConnect ?? false,
          },
          clusterRetryStrategy: options.retryStrategy,
        });
      } else {
        this.client = new Redis({
          host: options.host ?? 'localhost',
          port: options.port ?? 6379,
          password: options.password,
          db: options.db ?? 0,
          tls: options.tls ? {} : undefined,
          keyPrefix: options.keyPrefix,
          enableAutoPipelining: options.enableAutoPipelining ?? false,
          maxRetriesPerRequest: options.maxRetriesPerRequest ?? null,
          retryStrategy: options.retryStrategy ?? this.defaultRetryStrategy(),
          connectTimeout: options.connectTimeout ?? 10000,
          lazyConnect: options.lazyConnect ?? false,
        });
      }

      this.client.on('connect', () => {
        this.logger.log('Redis client connecting');
      });

      this.client.on('ready', () => {
        this.connected = true;
        this.logger.log('Redis client ready');
      });

      this.client.on('error', (err: Error) => {
        this.logger.error(`Redis client error: ${err.message}`);
      });

      this.client.on('close', () => {
        this.connected = false;
        this.logger.warn('Redis connection closed');
      });

      this.client.on('reconnecting', (ms: number) => {
        this.logger.log(`Redis reconnecting in ${ms}ms`);
      });

      if (!options.lazyConnect) {
        await this.client.connect();
      }

      this.logger.log(`Redis connection established (cluster: ${this.isClusterMode})`);
    } catch (err) {
      throw new ConnectionError((err as Error).message);
    }
  }

  getClient(): Redis | Cluster {
    if (!this.client) {
      throw new ConnectionError('Redis not initialized. Call initialize() first.');
    }
    return this.client;
  }

  getNativeClient(): Redis {
    const client = this.getClient();
    return client as unknown as Redis;
  }

  async execute<T = unknown>(command: string, args?: (string | Buffer | number)[]): Promise<T> {
    const start = Date.now();
    try {
      const client = this.getClient();
      const result = await (client as any)[command](...(args ?? []));
      const durationMs = Date.now() - start;
      if (durationMs > this.slowQueryThresholdMs) {
        this.logger.warn(`Slow command (${durationMs}ms): ${command}`);
      }
      return result as T;
    } catch (err) {
      const durationMs = Date.now() - start;
      this.logger.error(`Command failed after ${durationMs}ms: ${command}`);
      throw new QueryError((err as Error).message);
    }
  }

  async ping(): Promise<boolean> {
    try {
      const client = this.getClient();
      const result = await client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  async info(section?: string): Promise<string> {
    const client = this.getClient();
    if (section) {
      return client.info(section);
    }
    return client.info();
  }

  async dbsize(): Promise<number> {
    const client = this.getClient();
    return client.dbsize();
  }

  async flushDb(): Promise<void> {
    const client = this.getClient();
    await client.flushdb();
  }

  isConnected(): boolean {
    return this.connected && this.client !== null && this.client.status === 'ready';
  }

  isCluster(): boolean {
    return this.isClusterMode;
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.connected = false;
      this.logger.log('Redis connection closed');
    }
  }

  async getStatus(): Promise<{ status: string; connected: boolean; cluster: boolean }> {
    const client = this.getClient();
    return {
      status: client.status,
      connected: this.isConnected(),
      cluster: this.isClusterMode,
    };
  }

  async getClusterHealth(): Promise<ClusterHealth | null> {
    if (!this.isClusterMode || !this.client) return null;
    try {
      const client = this.client as Cluster;
      const info = await client.cluster('INFO');
      const lines = (info as string).split('\n');
      const nodeCount = (await client.cluster('NODES') as string).split('\n').filter(l => l.trim()).length;
      const state = lines.find(l => l.startsWith('cluster_state'))?.split(':')[1]?.trim() ?? 'fail';
      return {
        nodeCount,
        healthyNodes: nodeCount,
        state: state as 'ok' | 'fail' | 'loading',
        slotsAssigned: 16384,
      };
    } catch {
      return null;
    }
  }

  async getMemoryInfo(): Promise<{
    used: number;
    peakUsed: number;
    fragmentation: number;
  }> {
    const info = await this.info('memory');
    const used = parseInt(info.match(/used_memory:(\d+)/)?.[1] ?? '0', 10);
    const peakUsed = parseInt(info.match(/used_memory_peak:(\d+)/)?.[1] ?? '0', 10);
    const fragmentation = parseFloat(info.match(/mem_fragmentation_ratio:([\d.]+)/)?.[1] ?? '1.0');
    return { used, peakUsed, fragmentation };
  }

  async getUptime(): Promise<number> {
    const info = await this.info('server');
    return parseInt(info.match(/uptime_in_seconds:(\d+)/)?.[1] ?? '0', 10);
  }

  async getConnectedClients(): Promise<number> {
    const info = await this.info('clients');
    return parseInt(info.match(/connected_clients:(\d+)/)?.[1] ?? '0', 10);
  }

  private defaultRetryStrategy(): (times: number) => number | null {
    return (times: number) => {
      if (times > 10) return null;
      return Math.min(times * 100, 3000);
    };
  }
}
