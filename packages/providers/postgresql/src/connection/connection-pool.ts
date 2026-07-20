import { Injectable, Logger } from '@nestjs/common';
import pg from 'pg';
import type { PostgreSQLConnectionOptions, PoolMetrics } from '../types';
import { PoolError } from '../errors';

const { Pool } = pg;

@Injectable()
export class ConnectionPool {
  private readonly logger = new Logger(ConnectionPool.name);
  private pool: pg.Pool | null = null;
  private poolSize = 10;

  async initialize(options: PostgreSQLConnectionOptions): Promise<void> {
    this.poolSize = options.poolSize ?? 10;
    this.pool = new Pool({
      host: options.host,
      port: options.port,
      database: options.database,
      user: options.username,
      password: options.password,
      ssl: options.ssl ?? false,
      max: this.poolSize,
      idleTimeoutMillis: options.idleTimeoutMs ?? 30000,
      connectionTimeoutMillis: options.connectionTimeoutMs ?? 5000,
      statement_timeout: options.statementTimeoutMs ?? 30000,
      query_timeout: options.queryTimeoutMs ?? 30000,
    });

    this.pool.on('error', (err: Error) => {
      this.logger.error(`Pool error: ${err.message}`);
    });

    this.pool.on('connect', () => {
      this.logger.debug('New connection acquired from pool');
    });

    this.pool.on('remove', () => {
      this.logger.debug('Connection removed from pool');
    });

    await this.validate();
    this.logger.log(`Connection pool initialized (size: ${this.poolSize})`);
  }

  async validate(): Promise<void> {
    if (!this.pool) {
      throw new PoolError('Pool not initialized');
    }
    const client = await this.pool.connect();
    try {
      await client.query('SELECT 1');
    } finally {
      client.release();
    }
  }

  getPool(): pg.Pool {
    if (!this.pool) {
      throw new PoolError('Pool not initialized. Call initialize() first.');
    }
    return this.pool;
  }

  async acquireClient(): Promise<pg.PoolClient> {
    const pool = this.getPool();
    try {
      const client = await pool.connect();
      return client;
    } catch (err) {
      throw new PoolError(`Failed to acquire client: ${(err as Error).message}`);
    }
  }

  releaseClient(client: pg.PoolClient): void {
    client.release();
  }

  async query<T extends pg.QueryResultRow = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<pg.QueryResult<T>> {
    const pool = this.getPool();
    try {
      const result = await pool.query<T>(sql, params);
      return result;
    } catch (err) {
      throw new PoolError(`Query failed: ${(err as Error).message}`);
    }
  }

  getMetrics(): PoolMetrics {
    const pool = this.pool;
    if (!pool) {
      return {
        totalConnections: 0,
        idleConnections: 0,
        activeConnections: 0,
        waitingRequests: 0,
        maxConnections: this.poolSize,
      };
    }
    return {
      totalConnections: pool.totalCount,
      idleConnections: pool.idleCount,
      activeConnections: pool.waitingCount,
      waitingRequests: pool.waitingCount,
      maxConnections: this.poolSize,
    };
  }

  async shutdown(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.logger.log('Connection pool shut down');
    }
  }
}
