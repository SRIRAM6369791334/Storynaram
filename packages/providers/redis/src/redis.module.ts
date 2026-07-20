import { Module, Global, DynamicModule, Provider } from '@nestjs/common';
import { RedisConnection } from './connection/redis-connection';
import { ConnectionPool } from './connection/connection-pool';
import { RedisCacheProvider } from './cache/redis-cache-provider';
import { DistributedLockManager } from './lock/distributed-lock-manager';
import { PubSubManager } from './pubsub/pubsub-manager';
import { StreamManager } from './stream/stream-manager';
import { QueueManager } from './queue/queue-manager';
import { SessionStore } from './session/session-store';
import { RateLimiter } from './rate-limiter/rate-limiter';
import { RedisHealthIndicator } from './health/health-indicator';
import { MetricsCollector } from './metrics/metrics-collector';
import { StatisticsService } from './statistics/statistics-service';
import { WorkflowCacheAdapter } from './storage/workflow-cache-adapter';
import { AICacheAdapter } from './storage/ai-cache-adapter';
import { PluginCacheAdapter } from './storage/plugin-cache-adapter';
import {
  REDIS_MODULE_OPTIONS,
  REDIS_CONNECTION_OPTIONS,
  REDIS_CONNECTION,
  REDIS_CACHE_PROVIDER,
  REDIS_DISTRIBUTED_LOCK_MANAGER,
  REDIS_PUBSUB_MANAGER,
  REDIS_STREAM_MANAGER,
  REDIS_QUEUE_MANAGER,
  REDIS_SESSION_STORE,
  REDIS_RATE_LIMITER,
  REDIS_HEALTH_INDICATOR,
  REDIS_METRICS_COLLECTOR,
  REDIS_STATISTICS_SERVICE,
  REDIS_WORKFLOW_CACHE,
  REDIS_AI_CACHE,
  REDIS_PLUGIN_CACHE,
} from './tokens';
import type { RedisModuleOptions, RedisModuleAsyncOptions } from './tokens';

const sharedProviders: Provider[] = [
  ConnectionPool,
  RedisCacheProvider,
  DistributedLockManager,
  PubSubManager,
  StreamManager,
  QueueManager,
  SessionStore,
  RateLimiter,
  RedisHealthIndicator,
  StatisticsService,
];

@Global()
@Module({})
export class RedisModule {
  static forRoot(options: RedisModuleOptions): DynamicModule {
    return {
      module: RedisModule,
      global: true,
      providers: [
        ...sharedProviders,
        {
          provide: REDIS_MODULE_OPTIONS,
          useValue: options,
        },
        {
          provide: REDIS_CONNECTION_OPTIONS,
          useValue: options.connection,
        },
        {
          provide: RedisConnection,
          useFactory: async () => {
            const conn = new RedisConnection(options);
            await conn.initialize(options.connection);
            return conn;
          },
        },
        {
          provide: REDIS_CONNECTION,
          useExisting: RedisConnection,
        },
        {
          provide: REDIS_CACHE_PROVIDER,
          useExisting: RedisCacheProvider,
        },
        {
          provide: REDIS_DISTRIBUTED_LOCK_MANAGER,
          useExisting: DistributedLockManager,
        },
        {
          provide: REDIS_PUBSUB_MANAGER,
          useExisting: PubSubManager,
        },
        {
          provide: REDIS_STREAM_MANAGER,
          useExisting: StreamManager,
        },
        {
          provide: REDIS_QUEUE_MANAGER,
          useExisting: QueueManager,
        },
        {
          provide: REDIS_SESSION_STORE,
          useExisting: SessionStore,
        },
        {
          provide: REDIS_RATE_LIMITER,
          useExisting: RateLimiter,
        },
        {
          provide: REDIS_HEALTH_INDICATOR,
          useExisting: RedisHealthIndicator,
        },
        {
          provide: REDIS_METRICS_COLLECTOR,
          useFactory: (connection: RedisConnection, options: RedisModuleOptions) => {
            const collector = new MetricsCollector(connection);
            if (options.enableMetrics) {
              collector.startCollection();
            }
            return collector;
          },
          inject: [RedisConnection, REDIS_MODULE_OPTIONS],
        },
        {
          provide: REDIS_STATISTICS_SERVICE,
          useExisting: StatisticsService,
        },
        {
          provide: REDIS_WORKFLOW_CACHE,
          useFactory: (connection: RedisConnection) => {
            return new WorkflowCacheAdapter(connection, `${options.prefix ?? 'storynaram'}:workflow`);
          },
          inject: [RedisConnection],
        },
        {
          provide: REDIS_AI_CACHE,
          useFactory: (connection: RedisConnection) => {
            return new AICacheAdapter(connection, `${options.prefix ?? 'storynaram'}:ai`);
          },
          inject: [RedisConnection],
        },
        {
          provide: REDIS_PLUGIN_CACHE,
          useFactory: (connection: RedisConnection) => {
            return new PluginCacheAdapter(connection, `${options.prefix ?? 'storynaram'}:plugin`);
          },
          inject: [RedisConnection],
        },
      ],
      exports: [
        RedisConnection,
        ConnectionPool,
        RedisCacheProvider,
        DistributedLockManager,
        PubSubManager,
        StreamManager,
        QueueManager,
        SessionStore,
        RateLimiter,
        RedisHealthIndicator,
        StatisticsService,
        REDIS_CONNECTION,
        REDIS_CACHE_PROVIDER,
        REDIS_DISTRIBUTED_LOCK_MANAGER,
        REDIS_PUBSUB_MANAGER,
        REDIS_STREAM_MANAGER,
        REDIS_QUEUE_MANAGER,
        REDIS_SESSION_STORE,
        REDIS_RATE_LIMITER,
        REDIS_HEALTH_INDICATOR,
        REDIS_METRICS_COLLECTOR,
        REDIS_STATISTICS_SERVICE,
        REDIS_WORKFLOW_CACHE,
        REDIS_AI_CACHE,
        REDIS_PLUGIN_CACHE,
      ],
    };
  }

  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    return {
      module: RedisModule,
      global: true,
      imports: options.imports ?? [],
      providers: [
        ...sharedProviders,
        {
          provide: REDIS_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject,
        },
        {
          provide: REDIS_CONNECTION_OPTIONS,
          useFactory: (moduleOptions: RedisModuleOptions) => moduleOptions.connection,
          inject: [REDIS_MODULE_OPTIONS],
        },
        {
          provide: RedisConnection,
          useFactory: async (moduleOptions: RedisModuleOptions) => {
            const conn = new RedisConnection(moduleOptions);
            await conn.initialize(moduleOptions.connection);
            return conn;
          },
          inject: [REDIS_MODULE_OPTIONS],
        },
        {
          provide: REDIS_CONNECTION,
          useExisting: RedisConnection,
        },
        {
          provide: REDIS_CACHE_PROVIDER,
          useExisting: RedisCacheProvider,
        },
        {
          provide: REDIS_DISTRIBUTED_LOCK_MANAGER,
          useExisting: DistributedLockManager,
        },
        {
          provide: REDIS_PUBSUB_MANAGER,
          useExisting: PubSubManager,
        },
        {
          provide: REDIS_STREAM_MANAGER,
          useExisting: StreamManager,
        },
        {
          provide: REDIS_QUEUE_MANAGER,
          useExisting: QueueManager,
        },
        {
          provide: REDIS_SESSION_STORE,
          useExisting: SessionStore,
        },
        {
          provide: REDIS_RATE_LIMITER,
          useExisting: RateLimiter,
        },
        {
          provide: REDIS_HEALTH_INDICATOR,
          useExisting: RedisHealthIndicator,
        },
        {
          provide: REDIS_METRICS_COLLECTOR,
          useFactory: (connection: RedisConnection, moduleOptions: RedisModuleOptions) => {
            const collector = new MetricsCollector(connection);
            if (moduleOptions.enableMetrics) {
              collector.startCollection();
            }
            return collector;
          },
          inject: [RedisConnection, REDIS_MODULE_OPTIONS],
        },
        {
          provide: REDIS_STATISTICS_SERVICE,
          useExisting: StatisticsService,
        },
        {
          provide: REDIS_WORKFLOW_CACHE,
          useFactory: (connection: RedisConnection, moduleOptions: RedisModuleOptions) => {
            return new WorkflowCacheAdapter(connection, `${moduleOptions.prefix ?? 'storynaram'}:workflow`);
          },
          inject: [RedisConnection, REDIS_MODULE_OPTIONS],
        },
        {
          provide: REDIS_AI_CACHE,
          useFactory: (connection: RedisConnection, moduleOptions: RedisModuleOptions) => {
            return new AICacheAdapter(connection, `${moduleOptions.prefix ?? 'storynaram'}:ai`);
          },
          inject: [RedisConnection, REDIS_MODULE_OPTIONS],
        },
        {
          provide: REDIS_PLUGIN_CACHE,
          useFactory: (connection: RedisConnection, moduleOptions: RedisModuleOptions) => {
            return new PluginCacheAdapter(connection, `${moduleOptions.prefix ?? 'storynaram'}:plugin`);
          },
          inject: [RedisConnection, REDIS_MODULE_OPTIONS],
        },
      ],
      exports: [
        RedisConnection,
        ConnectionPool,
        RedisCacheProvider,
        DistributedLockManager,
        PubSubManager,
        StreamManager,
        QueueManager,
        SessionStore,
        RateLimiter,
        RedisHealthIndicator,
        StatisticsService,
        REDIS_CONNECTION,
        REDIS_CACHE_PROVIDER,
        REDIS_DISTRIBUTED_LOCK_MANAGER,
        REDIS_PUBSUB_MANAGER,
        REDIS_STREAM_MANAGER,
        REDIS_QUEUE_MANAGER,
        REDIS_SESSION_STORE,
        REDIS_RATE_LIMITER,
        REDIS_HEALTH_INDICATOR,
        REDIS_METRICS_COLLECTOR,
        REDIS_STATISTICS_SERVICE,
        REDIS_WORKFLOW_CACHE,
        REDIS_AI_CACHE,
        REDIS_PLUGIN_CACHE,
      ],
    };
  }
}
