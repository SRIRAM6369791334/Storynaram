export { SQLiteModule } from './sqlite.module';
export { SQLiteConnection } from './connection/sqlite-connection';
export { TransactionManager } from './transaction/transaction-manager';
export { QueryCompiler } from './query/query-compiler';
export { QueryExecutor } from './query/query-executor';
export { RepositoryAdapter } from './repository/repository-adapter';
export { EntityMapper } from './repository/entity-mapper';
export { RelationshipMapper } from './repository/relationship-mapper';
export { MigrationRunner } from './migration/migration-runner';
export { SchemaManager } from './migration/schema-manager';
export { WorkflowStorageAdapter } from './storage/workflow-storage-adapter';
export { AIStorageAdapter } from './storage/ai-storage-adapter';
export { PluginStorageAdapter } from './storage/plugin-storage-adapter';
export { HealthIndicator } from './observability/health-indicator';
export { MetricsCollector } from './observability/metrics-collector';
export { StatisticsService } from './observability/statistics-service';

export {
  SQLiteProviderError,
  ConnectionError,
  QueryError,
  MigrationError,
  TransactionError,
  ConfigurationError,
} from './errors';

export {
  SQLITE_MODULE_OPTIONS,
  SQLITE_CONNECTION_OPTIONS,
  SQLITE_DATABASE,
  SQLITE_CONNECTION,
  SQLITE_TRANSACTION_MANAGER,
  SQLITE_MIGRATION_RUNNER,
  SQLITE_SCHEMA_MANAGER,
  SQLITE_REPOSITORY_ADAPTER,
  SQLITE_HEALTH_INDICATOR,
  SQLITE_METRICS_COLLECTOR,
  SQLITE_STATISTICS_SERVICE,
  getRepositoryAdapterToken,
} from './tokens';
export type { SQLiteModuleOptions, SQLiteModuleAsyncOptions } from './tokens';

export type {
  SQLiteConnectionOptions,
  CompiledQuery,
  QueryResult,
  HealthCheckResult,
  MigrationRecord,
  MigrationDefinition,
  SlowQueryLog,
  ProviderStatistics,
  ColumnMapping,
  TableMapping,
} from './types';
