import { Module, Global, DynamicModule, Logger, Provider } from '@nestjs/common';
import { ConnectionPool } from './connection/connection-pool';
import { PostgreSQLConnection } from './connection/postgresql-connection';
import { TransactionManager } from './transaction/transaction-manager';
import { QueryCompiler } from './query/query-compiler';
import { QueryExecutor } from './query/query-executor';
import { RepositoryAdapter } from './repository/repository-adapter';
import { EntityMapper } from './repository/entity-mapper';
import { RelationshipMapper } from './repository/relationship-mapper';
import { MigrationRunner } from './migration/migration-runner';
import { SchemaManager } from './migration/schema-manager';
import { WorkflowStorageAdapter } from './storage/workflow-storage-adapter';
import { AIStorageAdapter } from './storage/ai-storage-adapter';
import { PluginStorageAdapter } from './storage/plugin-storage-adapter';
import { HealthIndicator } from './observability/health-indicator';
import { MetricsCollector } from './observability/metrics-collector';
import { StatisticsService } from './observability/statistics-service';
import {
  POSTGRESQL_MODULE_OPTIONS,
  POSTGRESQL_CONNECTION_OPTIONS,
  POSTGRESQL_METRICS_COLLECTOR,
  getRepositoryAdapterToken,
} from './tokens';
import type { PostgresModuleOptions, PostgresModuleAsyncOptions } from './tokens';

const sharedProviders: Provider[] = [
  ConnectionPool,
  PostgreSQLConnection,
  TransactionManager,
  QueryCompiler,
  QueryExecutor,
  EntityMapper,
  RelationshipMapper,
  SchemaManager,
  MigrationRunner,
  WorkflowStorageAdapter,
  AIStorageAdapter,
  PluginStorageAdapter,
  HealthIndicator,
  StatisticsService,
  {
    provide: POSTGRESQL_METRICS_COLLECTOR,
    useFactory: (options?: PostgresModuleOptions) => {
      const threshold = options?.slowQueryThresholdMs ?? 1000;
      return new MetricsCollector(threshold);
    },
    inject: [{ token: POSTGRESQL_MODULE_OPTIONS, optional: true }],
  },
];

@Global()
@Module({})
export class PostgreSQLModule {
  static forRoot(options: PostgresModuleOptions): DynamicModule {
    const adapterProviders = this.createRepositoryAdapters(options);

    return {
      module: PostgreSQLModule,
      global: true,
      providers: [
        ...sharedProviders,
        {
          provide: POSTGRESQL_MODULE_OPTIONS,
          useValue: options,
        },
        {
          provide: POSTGRESQL_CONNECTION_OPTIONS,
          useValue: options.connection,
        },
        {
          provide: ConnectionPool,
          useFactory: async (pool: ConnectionPool) => {
            await pool.initialize(options.connection);
            return pool;
          },
          inject: [ConnectionPool],
        },
        {
          provide: POSTGRESQL_METRICS_COLLECTOR,
          useFactory: () => new MetricsCollector(options.slowQueryThresholdMs ?? 1000),
        },
        ...adapterProviders,
      ],
      exports: [
        ConnectionPool,
        PostgreSQLConnection,
        TransactionManager,
        QueryCompiler,
        QueryExecutor,
        EntityMapper,
        RelationshipMapper,
        SchemaManager,
        MigrationRunner,
        WorkflowStorageAdapter,
        AIStorageAdapter,
        PluginStorageAdapter,
        HealthIndicator,
        StatisticsService,
        POSTGRESQL_METRICS_COLLECTOR,
      ],
    };
  }

  static forRootAsync(options: PostgresModuleAsyncOptions): DynamicModule {
    const adapterProviders = this.createRepositoryAdapters();

    return {
      module: PostgreSQLModule,
      global: true,
      imports: options.imports ?? [],
      providers: [
        ...sharedProviders,
        {
          provide: POSTGRESQL_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject,
        },
        {
          provide: POSTGRESQL_CONNECTION_OPTIONS,
          useFactory: (moduleOptions: PostgresModuleOptions) => moduleOptions.connection,
          inject: [POSTGRESQL_MODULE_OPTIONS],
        },
        {
          provide: ConnectionPool,
          useFactory: async (pool: ConnectionPool, moduleOptions: PostgresModuleOptions) => {
            await pool.initialize(moduleOptions.connection);
            return pool;
          },
          inject: [ConnectionPool, POSTGRESQL_MODULE_OPTIONS],
        },
        ...adapterProviders,
      ],
      exports: [
        ConnectionPool,
        PostgreSQLConnection,
        TransactionManager,
        QueryCompiler,
        QueryExecutor,
        EntityMapper,
        RelationshipMapper,
        SchemaManager,
        MigrationRunner,
        WorkflowStorageAdapter,
        AIStorageAdapter,
        PluginStorageAdapter,
        HealthIndicator,
        StatisticsService,
        POSTGRESQL_METRICS_COLLECTOR,
      ],
    };
  }

  static forFeature(entityTypes: string[]): DynamicModule {
    const providers: Provider[] = [];

    for (const entityType of entityTypes) {
      const token = getRepositoryAdapterToken(entityType);
      providers.push({
        provide: token,
        useFactory: (
          connection: PostgreSQLConnection,
          txnManager: TransactionManager,
          queryCompiler: QueryCompiler,
          entityMapper: EntityMapper,
          metrics?: MetricsCollector,
        ) => {
          const tableName = entityType.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
          return new RepositoryAdapter(entityType, tableName, connection, txnManager, queryCompiler, entityMapper, metrics);
        },
        inject: [PostgreSQLConnection, TransactionManager, QueryCompiler, EntityMapper, POSTGRESQL_METRICS_COLLECTOR],
      });
    }

    return {
      module: PostgreSQLModule,
      providers,
      exports: providers,
    };
  }

  private static createRepositoryAdapters(options?: PostgresModuleOptions): Provider[] {
    return [];
  }
}
