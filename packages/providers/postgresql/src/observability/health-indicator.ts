import { Injectable, Logger } from '@nestjs/common';
import { ConnectionPool } from '../connection/connection-pool';
import { PostgreSQLConnection } from '../connection/postgresql-connection';
import type { HealthCheckResult } from '../types';

@Injectable()
export class HealthIndicator {
  private readonly logger = new Logger(HealthIndicator.name);
  private lastCheck: HealthCheckResult | null = null;

  constructor(
    private readonly pool: ConnectionPool,
    private readonly connection: PostgreSQLConnection,
  ) {}

  async check(): Promise<HealthCheckResult> {
    const start = Date.now();
    let connectionOk = false;
    let replicationStatus: { status: string; lag?: number } | undefined;

    try {
      const result = await this.connection.execute<{ result: number }>('SELECT 1 as result');
      connectionOk = result.rowCount === 1;

      if (connectionOk) {
        replicationStatus = await this.checkReplication();
      }
    } catch (err) {
      this.logger.error(`Health check failed: ${(err as Error).message}`);
      connectionOk = false;
    }

    const latencyMs = Date.now() - start;
    const poolMetrics = this.pool.getMetrics();

    const status: HealthCheckResult['status'] = connectionOk
      ? (poolMetrics.activeConnections < poolMetrics.maxConnections * 0.9 ? 'healthy' : 'degraded')
      : 'unhealthy';

    this.lastCheck = {
      status,
      connection: connectionOk,
      pool: poolMetrics,
      replication: replicationStatus,
      latencyMs,
      lastChecked: new Date(),
    };

    return this.lastCheck;
  }

  async getLastCheck(): Promise<HealthCheckResult | null> {
    return this.lastCheck;
  }

  private async checkReplication(): Promise<{ status: string; lag?: number } | undefined> {
    try {
      const result = await this.connection.execute<{ pg_is_in_recovery: boolean; replay_lag?: string }>(
        `SELECT pg_is_in_recovery()`,
      );
      const inRecovery = result.rows[0]?.pg_is_in_recovery;

      if (inRecovery) {
        const lagResult = await this.connection.execute<{ replay_lag: string | null }>(
          `SELECT COALESCE(pg_last_wal_receive_lsn() = pg_last_wal_replay_lsn(), false) as replay_lag`,
        );
        return {
          status: 'replica',
          lag: lagResult.rows[0]?.replay_lag === null ? undefined : 0,
        };
      }

      return { status: 'primary' };
    } catch {
      return undefined;
    }
  }
}
