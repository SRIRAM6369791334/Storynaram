export { RedisModule } from './redis.module';
export { RedisConnection } from './connection/redis-connection';
export { ConnectionPool } from './connection/connection-pool';
export { RedisCacheProvider } from './cache/redis-cache-provider';
export { DistributedLockManager } from './lock/distributed-lock-manager';
export { PubSubManager } from './pubsub/pubsub-manager';
export { StreamManager } from './stream/stream-manager';
export { QueueManager } from './queue/queue-manager';
export { SessionStore } from './session/session-store';
export { RateLimiter } from './rate-limiter/rate-limiter';
export { RedisHealthIndicator } from './health/health-indicator';
export { MetricsCollector } from './metrics/metrics-collector';
export { StatisticsService } from './statistics/statistics-service';
export { WorkflowCacheAdapter } from './storage/workflow-cache-adapter';
export { AICacheAdapter } from './storage/ai-cache-adapter';
export { PluginCacheAdapter } from './storage/plugin-cache-adapter';

export {
  RedisProviderError,
  ConnectionError,
  QueryError,
  LockError,
  LockNotAcquiredError,
  PubSubError,
  StreamError,
  QueueError,
  RateLimitError,
  SessionError,
} from './errors';

export {
  REDIS_MODULE_OPTIONS,
  REDIS_CONNECTION_OPTIONS,
  REDIS_CLIENT,
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
  getCacheToken,
} from './tokens';
export type { RedisModuleOptions, RedisModuleAsyncOptions } from './tokens';

export type {
  RedisConnectionOptions,
  CacheOptions,
  CacheEntry,
  CacheStats,
  LockOptions,
  PubSubEvent,
  StreamOptions,
  StreamMessage,
  StreamConsumerGroupInfo,
  RateLimiterOptions,
  RateLimitResult,
  SessionData,
  HealthCheckResult,
  MetricsData,
  SlowCommandLog,
  ProviderStatistics,
  ClusterHealth,
} from './types';
