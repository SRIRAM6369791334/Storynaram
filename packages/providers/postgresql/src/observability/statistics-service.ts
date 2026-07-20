import { Injectable, Logger } from '@nestjs/common';
import { ConnectionPool } from '../connection/connection-pool';
import { TransactionManager } from '../transaction/transaction-manager';
import { MigrationRunner } from '../migration/migration-runner';
import { MetricsCollector } from './metrics-collector';
import type { ProviderStatistics } from '../types';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(
    private readonly pool: ConnectionPool,
    private readonly transactionManager: TransactionManager,
    private readonly migrationRunner: MigrationRunner,
    private readonly metrics: MetricsCollector,
  ) {}

  async getStatistics(): Promise<ProviderStatistics> {
    const poolMetrics = this.pool.getMetrics();
    const appMetrics = this.metrics.getMetrics();
    let totalMigrations = 0;

    try {
      const migrations = await this.migrationRunner.getAppliedMigrations();
      totalMigrations = migrations.length;
    } catch {
      totalMigrations = 0;
    }

    const poolUtilization = poolMetrics.maxConnections > 0
      ? Math.round((poolMetrics.activeConnections / poolMetrics.maxConnections) * 100)
      : 0;

    return {
      totalConnections: poolMetrics.totalConnections,
      totalQueries: appMetrics.totalQueries,
      totalTransactions: appMetrics.totalTransactions,
      totalMigrations,
      averageQueryDurationMs: appMetrics.averageQueryDurationMs,
      slowQueryCount: appMetrics.slowQueryCount,
      errorCount: appMetrics.totalErrors,
      poolUtilizationPercent: poolUtilization,
      uptimeMs: appMetrics.uptimeMs,
    };
  }
}
