import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import RedisMock from 'ioredis-mock';
import { RedisModule } from '../src/redis.module';
import { RedisConnection } from '../src/connection/redis-connection';
import { RedisCacheProvider } from '../src/cache/redis-cache-provider';
import { DistributedLockManager } from '../src/lock/distributed-lock-manager';
import { PubSubManager } from '../src/pubsub/pubsub-manager';
import { StreamManager } from '../src/stream/stream-manager';
import { QueueManager } from '../src/queue/queue-manager';
import { SessionStore } from '../src/session/session-store';
import { RateLimiter } from '../src/rate-limiter/rate-limiter';
import { RedisHealthIndicator } from '../src/health/health-indicator';
import { StatisticsService } from '../src/statistics/statistics-service';
import { WorkflowCacheAdapter } from '../src/storage/workflow-cache-adapter';
import { AICacheAdapter } from '../src/storage/ai-cache-adapter';
import { PluginCacheAdapter } from '../src/storage/plugin-cache-adapter';
import {
  REDIS_CONNECTION,
  REDIS_CACHE_PROVIDER,
  REDIS_DISTRIBUTED_LOCK_MANAGER,
  REDIS_PUBSUB_MANAGER,
  REDIS_STREAM_MANAGER,
  REDIS_QUEUE_MANAGER,
  REDIS_SESSION_STORE,
  REDIS_RATE_LIMITER,
  REDIS_HEALTH_INDICATOR,
  REDIS_STATISTICS_SERVICE,
  REDIS_WORKFLOW_CACHE,
  REDIS_AI_CACHE,
  REDIS_PLUGIN_CACHE,
} from '../src/tokens';

vi.mock('ioredis', () => ({
  default: RedisMock,
  Cluster: RedisMock.Cluster,
}));

describe('RedisModule', () => {
  describe('forRoot', () => {
    let mod: any;

    beforeEach(async () => {
      mod = await Test.createTestingModule({
        imports: [
          RedisModule.forRoot({
            connection: { host: 'localhost', port: 6379, lazyConnect: true },
            prefix: 'test',
          }),
        ],
      }).compile();
    });

    it('provides RedisConnection', () => {
      const conn = mod.get(RedisConnection);
      expect(conn).toBeInstanceOf(RedisConnection);
    });

    it('provides RedisCacheProvider', () => {
      const cache = mod.get(RedisCacheProvider);
      expect(cache).toBeInstanceOf(RedisCacheProvider);
    });

    it('provides DistributedLockManager', () => {
      const lock = mod.get(DistributedLockManager);
      expect(lock).toBeInstanceOf(DistributedLockManager);
    });

    it('provides PubSubManager', () => {
      const pubsub = mod.get(PubSubManager);
      expect(pubsub).toBeInstanceOf(PubSubManager);
    });

    it('provides StreamManager', () => {
      const stream = mod.get(StreamManager);
      expect(stream).toBeInstanceOf(StreamManager);
    });

    it('provides QueueManager', () => {
      const queue = mod.get(QueueManager);
      expect(queue).toBeInstanceOf(QueueManager);
    });

    it('provides SessionStore', () => {
      const session = mod.get(SessionStore);
      expect(session).toBeInstanceOf(SessionStore);
    });

    it('provides RateLimiter', () => {
      const limiter = mod.get(RateLimiter);
      expect(limiter).toBeInstanceOf(RateLimiter);
    });

    it('provides RedisHealthIndicator', () => {
      const health = mod.get(RedisHealthIndicator);
      expect(health).toBeInstanceOf(RedisHealthIndicator);
    });

    it('provides StatisticsService', () => {
      const stats = mod.get(StatisticsService);
      expect(stats).toBeInstanceOf(StatisticsService);
    });

    it('provides WorkflowCacheAdapter via DI token', () => {
      const wf = mod.get(REDIS_WORKFLOW_CACHE);
      expect(wf).toBeInstanceOf(WorkflowCacheAdapter);
    });

    it('provides AICacheAdapter via DI token', () => {
      const ai = mod.get(REDIS_AI_CACHE);
      expect(ai).toBeInstanceOf(AICacheAdapter);
    });

    it('provides PluginCacheAdapter via DI token', () => {
      const plugin = mod.get(REDIS_PLUGIN_CACHE);
      expect(plugin).toBeInstanceOf(PluginCacheAdapter);
    });

    it('aliases REDIS_CONNECTION to RedisConnection', () => {
      const byToken = mod.get(REDIS_CONNECTION);
      const byClass = mod.get(RedisConnection);
      expect(byToken).toBe(byClass);
    });

    it('aliases REDIS_CACHE_PROVIDER to RedisCacheProvider', () => {
      expect(mod.get(REDIS_CACHE_PROVIDER)).toBe(mod.get(RedisCacheProvider));
    });

    it('aliases REDIS_DISTRIBUTED_LOCK_MANAGER to DistributedLockManager', () => {
      expect(mod.get(REDIS_DISTRIBUTED_LOCK_MANAGER)).toBe(mod.get(DistributedLockManager));
    });

    it('aliases REDIS_PUBSUB_MANAGER to PubSubManager', () => {
      expect(mod.get(REDIS_PUBSUB_MANAGER)).toBe(mod.get(PubSubManager));
    });

    it('aliases REDIS_STREAM_MANAGER to StreamManager', () => {
      expect(mod.get(REDIS_STREAM_MANAGER)).toBe(mod.get(StreamManager));
    });

    it('aliases REDIS_QUEUE_MANAGER to QueueManager', () => {
      expect(mod.get(REDIS_QUEUE_MANAGER)).toBe(mod.get(QueueManager));
    });

    it('aliases REDIS_SESSION_STORE to SessionStore', () => {
      expect(mod.get(REDIS_SESSION_STORE)).toBe(mod.get(SessionStore));
    });

    it('aliases REDIS_RATE_LIMITER to RateLimiter', () => {
      expect(mod.get(REDIS_RATE_LIMITER)).toBe(mod.get(RateLimiter));
    });

    it('aliases REDIS_HEALTH_INDICATOR to RedisHealthIndicator', () => {
      expect(mod.get(REDIS_HEALTH_INDICATOR)).toBe(mod.get(RedisHealthIndicator));
    });

    it('aliases REDIS_STATISTICS_SERVICE to StatisticsService', () => {
      expect(mod.get(REDIS_STATISTICS_SERVICE)).toBe(mod.get(StatisticsService));
    });
  });

  describe('forRootAsync', () => {
    it('configures async module', async () => {
      const mod = await Test.createTestingModule({
        imports: [
          RedisModule.forRootAsync({
            useFactory: () => ({
              connection: { host: 'localhost', port: 6379, lazyConnect: true },
              prefix: 'async-test',
            }),
          }),
        ],
      }).compile();
      expect(mod.get(RedisConnection)).toBeInstanceOf(RedisConnection);
      expect(mod.get(RedisCacheProvider)).toBeInstanceOf(RedisCacheProvider);
    });
  });
});
