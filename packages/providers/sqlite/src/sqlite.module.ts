import { Module, Global, DynamicModule, Provider } from '@nestjs/common';
import { SQLiteConnection } from './connection/sqlite-connection';
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
  SQLITE_MODULE_OPTIONS,
  SQLITE_CONNECTION_OPTIONS,
  SQLITE_METRICS_COLLECTOR,
  getRepositoryAdapterToken,
} from './tokens';
import type { SQLiteModuleOptions, SQLiteModuleAsyncOptions } from './tokens';

const sharedProviders: Provider[] = [
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
];

@Global()
@Module({})
export class SQLiteModule {
  static forRoot(options: SQLiteModuleOptions): DynamicModule {
    return {
      module: SQLiteModule,
      global: true,
      providers: [
        ...sharedProviders,
        {
          provide: SQLITE_MODULE_OPTIONS,
          useValue: options,
        },
        {
          provide: SQLITE_CONNECTION_OPTIONS,
          useValue: options.connection,
        },
        {
          provide: SQLiteConnection,
          useFactory: async () => {
            const conn = new SQLiteConnection();
            await conn.initialize(options.connection);
            return conn;
          },
        },
        {
          provide: SQLITE_METRICS_COLLECTOR,
          useFactory: () => new MetricsCollector(options.slowQueryThresholdMs ?? 500),
        },
      ],
      exports: [
        SQLiteConnection,
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
        SQLITE_METRICS_COLLECTOR,
      ],
    };
  }

  static forRootAsync(options: SQLiteModuleAsyncOptions): DynamicModule {
    return {
      module: SQLiteModule,
      global: true,
      imports: options.imports ?? [],
      providers: [
        ...sharedProviders,
        {
          provide: SQLITE_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject,
        },
        {
          provide: SQLITE_CONNECTION_OPTIONS,
          useFactory: (moduleOptions: SQLiteModuleOptions) => moduleOptions.connection,
          inject: [SQLITE_MODULE_OPTIONS],
        },
        {
          provide: SQLiteConnection,
          useFactory: async (moduleOptions: SQLiteModuleOptions) => {
            const conn = new SQLiteConnection();
            await conn.initialize(moduleOptions.connection);
            return conn;
          },
          inject: [SQLITE_MODULE_OPTIONS],
        },
        {
          provide: SQLITE_METRICS_COLLECTOR,
          useFactory: (options: SQLiteModuleOptions) => new MetricsCollector(options.slowQueryThresholdMs ?? 500),
          inject: [SQLITE_MODULE_OPTIONS],
        },
      ],
      exports: [
        SQLiteConnection,
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
        SQLITE_METRICS_COLLECTOR,
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
          connection: SQLiteConnection,
          txnManager: TransactionManager,
          queryCompiler: QueryCompiler,
          entityMapper: EntityMapper,
        ) => {
          const tableName = entityType.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
          return new RepositoryAdapter(entityType, tableName, connection, txnManager, queryCompiler, entityMapper);
        },
        inject: [SQLiteConnection, TransactionManager, QueryCompiler, EntityMapper],
      });
    }

    return {
      module: SQLiteModule,
      providers,
      exports: providers,
    };
  }
}
