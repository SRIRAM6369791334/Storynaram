import { Injectable, Logger } from '@nestjs/common';
import { SQLiteConnection } from '../connection/sqlite-connection';
import type { HealthCheckResult } from '../types';

@Injectable()
export class HealthIndicator {
  private readonly logger = new Logger(HealthIndicator.name);
  private lastCheck: HealthCheckResult | null = null;

  constructor(private readonly connection: SQLiteConnection) {}

  check(): HealthCheckResult {
    const start = Date.now();
    let connectionOk = false;
    let walMode = false;
    let integrityOk = false;
    let foreignKeysEnabled = false;

    try {
      this.connection.execute('SELECT 1');
      connectionOk = true;

      walMode = this.connection.isWalMode();
      foreignKeysEnabled = this.connection.isForeignKeysEnabled();

      const integrityResult = this.connection.runIntegrityCheck();
      integrityOk = integrityResult.length === 1 && integrityResult[0] === 'ok';
    } catch (err) {
      this.logger.error(`Health check failed: ${(err as Error).message}`);
    }

    const latencyMs = Date.now() - start;
    const pageCount = this.connection.getPageCount();
    const pageSize = this.connection.getPageSize();

    const status: HealthCheckResult['status'] = connectionOk
      ? (integrityOk ? 'healthy' : 'degraded')
      : 'unhealthy';

    this.lastCheck = {
      status,
      connection: connectionOk,
      walMode,
      integrityOk,
      foreignKeysEnabled,
      pageCount,
      fileSize: pageCount * pageSize,
      latencyMs,
      lastChecked: new Date(),
    };

    return this.lastCheck;
  }

  getLastCheck(): HealthCheckResult | null {
    return this.lastCheck;
  }
}
