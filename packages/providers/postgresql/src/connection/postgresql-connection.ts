import { Injectable, Logger } from '@nestjs/common';
import pg from 'pg';
import { ConnectionPool } from './connection-pool';
import type { QueryResult } from '../types';
import { QueryError } from '../errors';

@Injectable()
export class PostgreSQLConnection {
  private readonly logger = new Logger(PostgreSQLConnection.name);
  private readonly slowQueryThresholdMs: number;

  constructor(
    private readonly pool: ConnectionPool,
    slowQueryThresholdMs = 1000,
  ) {
    this.slowQueryThresholdMs = slowQueryThresholdMs;
  }

  async execute<T extends pg.QueryResultRow = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(sql, params);
      const durationMs = Date.now() - start;

      if (durationMs > this.slowQueryThresholdMs) {
        this.logger.warn(`Slow query (${durationMs}ms): ${sql.substring(0, 200)}`);
      }

      return {
        rows: result.rows,
        rowCount: result.rowCount ?? 0,
        command: result.command,
        durationMs,
      };
    } catch (err) {
      const durationMs = Date.now() - start;
      this.logger.error(`Query failed after ${durationMs}ms: ${(err as Error).message}`);
      throw new QueryError((err as Error).message);
    }
  }

  async executeRaw<T extends pg.QueryResultRow = Record<string, unknown>>(query: { sql: string; params?: unknown[] }): Promise<pg.QueryResult<T>> {
    try {
      const result = await this.pool.query<T>(query.sql, query.params);
      return result;
    } catch (err) {
      throw new QueryError((err as Error).message);
    }
  }

  async acquireDirectClient(): Promise<pg.PoolClient> {
    return this.pool.acquireClient();
  }

  releaseDirectClient(client: pg.PoolClient): void {
    client.release();
  }
}
