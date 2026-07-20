import { Injectable } from '@nestjs/common';
import { SQLiteConnection } from '../connection/sqlite-connection';
import { MigrationRunner } from '../migration/migration-runner';
import { MetricsCollector } from './metrics-collector';
import type { ProviderStatistics } from '../types';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly connection: SQLiteConnection,
    private readonly migrationRunner: MigrationRunner,
    private readonly metrics: MetricsCollector,
  ) {}

  getStatistics(): ProviderStatistics {
    const appMetrics = this.metrics.getMetrics();
    let totalMigrations = 0;
    try {
      totalMigrations = this.migrationRunner.getAppliedMigrations().length;
    } catch {
      totalMigrations = 0;
    }

    return {
      totalQueries: appMetrics.totalQueries,
      totalTransactions: appMetrics.totalTransactions,
      totalMigrations,
      averageQueryDurationMs: appMetrics.averageQueryDurationMs,
      slowQueryCount: appMetrics.slowQueryCount,
      errorCount: appMetrics.totalErrors,
      uptimeMs: appMetrics.uptimeMs,
      pageCount: this.connection.getPageCount(),
      pageSize: this.connection.getPageSize(),
      fileSize: this.connection.getFileSize(),
    };
  }
}
