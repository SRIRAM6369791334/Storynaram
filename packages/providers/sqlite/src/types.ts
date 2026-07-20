export interface SQLiteConnectionOptions {
  database: string;
  memory?: boolean;
  walMode?: boolean;
  busyTimeoutMs?: number;
  cacheSize?: number;
  foreignKeys?: boolean;
  journalMode?: 'DELETE' | 'TRUNCATE' | 'PERSIST' | 'MEMORY' | 'WAL' | 'OFF';
  synchronous?: 'OFF' | 'NORMAL' | 'FULL' | 'EXTRA';
  tempStore?: 'DEFAULT' | 'FILE' | 'MEMORY';
  pageSize?: number;
}

export interface SQLiteModuleOptions {
  connection: SQLiteConnectionOptions;
  migrations?: MigrationOptions;
  enableMetrics?: boolean;
  slowQueryThresholdMs?: number;
}

export interface MigrationOptions {
  migrationsTable?: string;
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
  lastInsertRowid?: number;
  changes?: number;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  connection: boolean;
  walMode: boolean;
  integrityOk: boolean;
  foreignKeysEnabled: boolean;
  fileSize?: number;
  pageCount?: number;
  latencyMs: number;
  lastChecked: Date;
}

export interface MigrationRecord {
  version: string;
  name: string;
  appliedAt: string;
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
  totalQueries: number;
  totalTransactions: number;
  totalMigrations: number;
  averageQueryDurationMs: number;
  slowQueryCount: number;
  errorCount: number;
  uptimeMs: number;
  pageCount: number;
  pageSize: number;
  fileSize: number;
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
