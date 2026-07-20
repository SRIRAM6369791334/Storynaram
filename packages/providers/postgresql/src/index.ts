export { PostgreSQLModule } from './postgresql.module';
export { ConnectionPool } from './connection/connection-pool';
export { PostgreSQLConnection } from './connection/postgresql-connection';
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
  PostgreSQLProviderError,
  ConnectionError,
  PoolError,
  QueryError,
  MigrationError,
  TransactionError,
  ConfigurationError,
} from './errors';

export {
  POSTGRESQL_MODULE_OPTIONS,
  POSTGRESQL_CONNECTION_OPTIONS,
  POSTGRESQL_POOL,
  POSTGRESQL_CONNECTION,
  POSTGRESQL_TRANSACTION_MANAGER,
  POSTGRESQL_MIGRATION_RUNNER,
  POSTGRESQL_SCHEMA_MANAGER,
  POSTGRESQL_REPOSITORY_ADAPTER,
  POSTGRESQL_HEALTH_INDICATOR,
  POSTGRESQL_METRICS_COLLECTOR,
  POSTGRESQL_STATISTICS_SERVICE,
  getRepositoryAdapterToken,
} from './tokens';
export type {
  PostgresModuleOptions,
  PostgresModuleAsyncOptions,
} from './tokens';

export type {
  PostgreSQLConnectionOptions,
  PostgreSQLModuleOptions,
  CompiledQuery,
  QueryResult,
  PoolMetrics,
  HealthCheckResult,
  MigrationRecord,
  MigrationDefinition,
  SlowQueryLog,
  ProviderStatistics,
  ColumnMapping,
  TableMapping,
} from './types';
