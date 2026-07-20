import { Injectable, Logger } from '@nestjs/common';
import pg from 'pg';
import { PostgreSQLConnection } from '../connection/postgresql-connection';
import { MetricsCollector } from '../observability/metrics-collector';
import type { QueryResult } from '../types';

@Injectable()
export class QueryExecutor {
  private readonly logger = new Logger(QueryExecutor.name);

  constructor(
    private readonly connection: PostgreSQLConnection,
    private readonly metrics?: MetricsCollector,
  ) {}

  async execute<T extends pg.QueryResultRow = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.connection.execute<T>(sql, params);
      const durationMs = Date.now() - start;
      this.metrics?.recordQuery(durationMs);
      return result;
    } catch (err) {
      const durationMs = Date.now() - start;
      this.metrics?.recordError();
      this.logger.error(`Execute failed (${durationMs}ms): ${(err as Error).message}`);
      throw err;
    }
  }

  async executeBatch<T extends pg.QueryResultRow = Record<string, unknown>>(statements: Array<{ sql: string; params?: unknown[] }>): Promise<QueryResult<T>[]> {
    const results: QueryResult<T>[] = [];
    for (const stmt of statements) {
      const result = await this.execute<T>(stmt.sql, stmt.params);
      results.push(result);
    }
    return results;
  }

  async executeInTransaction<T>(fn: (executor: QueryExecutor) => Promise<T>): Promise<T> {
    const client = await this.connection.acquireDirectClient();
    try {
      await client.query('BEGIN');
      const txnExecutor = new QueryExecutor(this.connection, this.metrics);
      const result = await fn(txnExecutor);
      await client.query('COMMIT');
      this.metrics?.recordTransaction();
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
