export interface PostgreSQLConnectionOptions {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean | Record<string, unknown>;
  poolSize?: number;
  connectionTimeoutMs?: number;
  idleTimeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  statementTimeoutMs?: number;
  queryTimeoutMs?: number;
}

export interface PostgreSQLModuleOptions {
  connection: PostgreSQLConnectionOptions;
  migrations?: MigrationOptions;
  healthCheckIntervalMs?: number;
  slowQueryThresholdMs?: number;
  enableMetrics?: boolean;
}

export interface MigrationOptions {
  migrationsTable?: string;
  migrationsPath?: string;
  enableSeed?: boolean;
}

export interface CompiledQuery {
  sql: string;
  params: unknown[];
}

export interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number;
  command: string;
  durationMs: number;
}

export interface PoolMetrics {
  totalConnections: number;
  idleConnections: number;
  activeConnections: number;
  waitingRequests: number;
  maxConnections: number;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  connection: boolean;
  pool: PoolMetrics;
  replication?: {
    status: string;
    lag?: number;
  };
  latencyMs: number;
  lastChecked: Date;
}

export interface MigrationRecord {
  version: string;
  name: string;
  appliedAt: Date;
  durationMs: number;
  checksum: string;
}

export interface MigrationDefinition {
  version: string;
  name: string;
  up: string[];
  down?: string[];
}

export interface SlowQueryLog {
  sql: string;
  params: unknown[];
  durationMs: number;
  timestamp: Date;
}

export interface ProviderStatistics {
  totalConnections: number;
  totalQueries: number;
  totalTransactions: number;
  totalMigrations: number;
  averageQueryDurationMs: number;
  slowQueryCount: number;
  errorCount: number;
  poolUtilizationPercent: number;
  uptimeMs: number;
}

export interface ColumnMapping {
  columnName: string;
  propertyName: string;
  type: string;
  primaryKey?: boolean;
  nullable?: boolean;
  default?: unknown;
}

export interface TableMapping {
  tableName: string;
  columns: ColumnMapping[];
  primaryKey: string;
  softDeleteColumn?: string;
  createdAtColumn?: string;
  updatedAtColumn?: string;
}
