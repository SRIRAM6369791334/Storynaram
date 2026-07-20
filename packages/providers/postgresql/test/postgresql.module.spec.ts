import { describe, it, expect } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PostgreSQLModule } from '../src/postgresql.module';
import { ConnectionPool } from '../src/connection/connection-pool';
import { TransactionManager } from '../src/transaction/transaction-manager';
import { QueryCompiler } from '../src/query/query-compiler';
import { QueryExecutor } from '../src/query/query-executor';
import { EntityMapper } from '../src/repository/entity-mapper';
import { RelationshipMapper } from '../src/repository/relationship-mapper';
import { MigrationRunner } from '../src/migration/migration-runner';
import { SchemaManager } from '../src/migration/schema-manager';
import { WorkflowStorageAdapter } from '../src/storage/workflow-storage-adapter';
import { AIStorageAdapter } from '../src/storage/ai-storage-adapter';
import { PluginStorageAdapter } from '../src/storage/plugin-storage-adapter';
import { HealthIndicator } from '../src/observability/health-indicator';
import { StatisticsService } from '../src/observability/statistics-service';
import { MetricsCollector } from '../src/observability/metrics-collector';
import { POSTGRESQL_METRICS_COLLECTOR } from '../src/tokens';

describe('PostgreSQLModule', () => {
  it('exports forRoot static method', () => {
    expect(PostgreSQLModule.forRoot).toBeDefined();
    expect(typeof PostgreSQLModule.forRoot).toBe('function');
  });

  it('exports forRootAsync static method', () => {
    expect(PostgreSQLModule.forRootAsync).toBeDefined();
    expect(typeof PostgreSQLModule.forRootAsync).toBe('function');
  });

  it('exports forFeature static method', () => {
    expect(PostgreSQLModule.forFeature).toBeDefined();
    expect(typeof PostgreSQLModule.forFeature).toBe('function');
  });

  it('forRoot creates dynamic module with expected providers', () => {
    const mod = PostgreSQLModule.forRoot({
      connection: {
        host: 'localhost',
        port: 5432,
        database: 'test',
        username: 'test',
        password: 'test',
      },
    });

    expect(mod.module).toBe(PostgreSQLModule);
    expect(mod.global).toBe(true);
    expect(mod.providers).toBeDefined();
    expect(mod.exports).toBeDefined();

    const exportTokens = mod.exports!.map((e: any) => typeof e === 'function' ? e.name : e);
    expect(exportTokens).toContain(ConnectionPool.name);
    expect(exportTokens).toContain(TransactionManager.name);
    expect(exportTokens).toContain(QueryCompiler.name);
    expect(exportTokens).toContain(EntityMapper.name);
    expect(exportTokens).toContain(MigrationRunner.name);
    expect(exportTokens).toContain(SchemaManager.name);
    expect(exportTokens).toContain(WorkflowStorageAdapter.name);
    expect(exportTokens).toContain(AIStorageAdapter.name);
    expect(exportTokens).toContain(PluginStorageAdapter.name);
    expect(exportTokens).toContain(HealthIndicator.name);
    expect(exportTokens).toContain(StatisticsService.name);
    expect(exportTokens).toContain(POSTGRESQL_METRICS_COLLECTOR);
  });

  it('forFeature creates repository adapter providers', () => {
    const mod = PostgreSQLModule.forFeature(['users', 'posts']);
    expect(mod.providers).toHaveLength(2);
  });
});
