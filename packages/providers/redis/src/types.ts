export interface RedisModuleOptions {
  connection: RedisConnectionOptions;
  prefix?: string;
  enableMetrics?: boolean;
  slowQueryThresholdMs?: number;
}

export interface RedisConnectionOptions {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  tls?: boolean;
  keyPrefix?: string;
  enableAutoPipelining?: boolean;
  maxRetriesPerRequest?: number;
  retryStrategy?: (times: number) => number | null;
  connectTimeout?: number;
  lazyConnect?: boolean;
  cluster?: boolean;
  nodes?: { host: string; port: number }[];
  sentinel?: boolean;
  sentinels?: { host: string; port: number }[];
  sentinelPassword?: string;
  name?: string;
}

export interface CacheOptions {
  ttl?: number;
  sliding?: boolean;
  absoluteExpiration?: number;
  namespace?: string;
}

export interface CacheEntry<T> {
  value: T;
  expiresAt?: number;
  createdAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memoryUsage?: number;
}

export interface LockOptions {
  ttl: number;
  retryDelay?: number;
  retryCount?: number;
  autoRenewal?: boolean;
  renewalInterval?: number;
}

export interface PubSubEvent<T = unknown> {
  channel: string;
  pattern?: string;
  data: T;
  timestamp: number;
}

export interface StreamOptions {
  maxLen?: number;
  group?: string;
  consumer?: string;
  blockMs?: number;
  count?: number;
}

export interface StreamMessage {
  id: string;
  fields: Record<string, string>;
  stream: string;
}

export interface StreamConsumerGroupInfo {
  name: string;
  consumers: number;
  pending: number;
  lag: number;
}

export interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  type: 'fixed' | 'sliding' | 'token-bucket' | 'leaky-bucket';
  refillRate?: number;
  burstSize?: number;
  leakRate?: number;
  capacity?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  totalLimit: number;
}

export interface SessionData {
  sessionId: string;
  data: Record<string, unknown>;
  expiresAt: number;
  createdAt: number;
  lastAccessedAt: number;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  connection: boolean;
  latency: number;
  memory?: {
    used: number;
    peakUsed: number;
    fragmentation: number;
  };
  uptime: number;
  connectedClients?: number;
  lastChecked: Date;
}

export interface MetricsData {
  commandCount: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  averageLatencyMs: number;
  operationsPerSecond: number;
  connectedClients: number;
  memoryUsed: number;
  uptimeSeconds: number;
  slowCommands: SlowCommandLog[];
}

export interface SlowCommandLog {
  command: string;
  args: string[];
  durationMs: number;
  timestamp: Date;
}

export interface ProviderStatistics {
  totalOperations: number;
  cacheHitRate: number;
  averageLatencyMs: number;
  errorCount: number;
  uptimeMs: number;
  memoryUsage: number;
  connectedClients: number;
}

export interface ClusterHealth {
  nodeCount: number;
  healthyNodes: number;
  state: 'ok' | 'fail' | 'loading';
  slotsAssigned: number;
}
