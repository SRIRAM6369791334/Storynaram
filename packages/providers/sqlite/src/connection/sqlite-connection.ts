import { Injectable, Logger } from '@nestjs/common';
import Database from 'better-sqlite3';
import type { SQLiteConnectionOptions } from '../types';
import type { QueryResult } from '../types';
import { ConnectionError, QueryError } from '../errors';

@Injectable()
export class SQLiteConnection {
  private readonly logger = new Logger(SQLiteConnection.name);
  private db: Database.Database | null = null;
  private readonly slowQueryThresholdMs = 500;
  private pragmasSet = false;

  async initialize(options: SQLiteConnectionOptions): Promise<void> {
    const dbPath = options.memory ? ':memory:' : options.database;
    try {
      this.db = new Database(dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');
      this.db.pragma(`busy_timeout = ${options.busyTimeoutMs ?? 5000}`);
      if (options.cacheSize) {
        this.db.pragma(`cache_size = ${options.cacheSize}`);
      }
      if (options.synchronous) {
        this.db.pragma(`synchronous = ${options.synchronous}`);
      }
      if (options.journalMode && options.journalMode !== 'WAL') {
        this.db.pragma(`journal_mode = ${options.journalMode}`);
      }
      if (options.tempStore) {
        this.db.pragma(`temp_store = ${options.tempStore}`);
      }
      if (options.pageSize) {
        this.db.pragma(`page_size = ${options.pageSize}`);
      }
      this.pragmasSet = true;
      this.logger.log(`SQLite database opened: ${options.memory ? ':memory:' : options.database}`);
    } catch (err) {
      throw new ConnectionError(`Failed to open database: ${(err as Error).message}`);
    }
  }

  getDb(): Database.Database {
    if (!this.db) {
      throw new ConnectionError('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  execute<T = Record<string, unknown>>(sql: string, params?: unknown[]): QueryResult<T> {
    const start = Date.now();
    try {
      const db = this.getDb();
      const stmt = db.prepare(sql);
      let rows: T[];
      let info: Database.RunResult | undefined;

      const lowerSql = sql.trim().toUpperCase();
      if (lowerSql.startsWith('SELECT') || lowerSql.startsWith('WITH') || lowerSql.startsWith('PRAGMA')) {
        rows = (params && params.length > 0 ? stmt.all(...params) : stmt.all()) as T[];
      } else {
        info = params && params.length > 0 ? stmt.run(...params) : stmt.run();
        rows = [];
      }

      const durationMs = Date.now() - start;
      if (durationMs > this.slowQueryThresholdMs) {
        this.logger.warn(`Slow query (${durationMs}ms): ${sql.substring(0, 200)}`);
      }

      return {
        rows,
        rowCount: rows.length,
        command: lowerSql.split(' ')[0] ?? '',
        durationMs,
        lastInsertRowid: info?.lastInsertRowid != null ? Number(info.lastInsertRowid) : undefined,
        changes: info?.changes != null ? Number(info.changes) : undefined,
      };
    } catch (err) {
      const durationMs = Date.now() - start;
      this.logger.error(`Query failed after ${durationMs}ms: ${(err as Error).message}`);
      throw new QueryError((err as Error).message);
    }
  }

  executeRaw<T = Record<string, unknown>>(sql: string, params?: unknown[]): T[] {
    const result = this.execute<T>(sql, params);
    return result.rows;
  }

  isWalMode(): boolean {
    try {
      const result = this.execute<{ journal_mode: string }>('PRAGMA journal_mode');
      return result.rows[0]?.journal_mode === 'wal';
    } catch {
      return false;
    }
  }

  isForeignKeysEnabled(): boolean {
    try {
      const result = this.execute<{ foreign_keys: number }>('PRAGMA foreign_keys');
      return result.rows[0]?.foreign_keys === 1;
    } catch {
      return false;
    }
  }

  runIntegrityCheck(): string[] {
    try {
      const result = this.execute<{ integrity_check: string }>('PRAGMA integrity_check');
      return result.rows.map(r => r.integrity_check);
    } catch {
      return ['error'];
    }
  }

  getPageCount(): number {
    try {
      const result = this.execute<{ page_count: number }>('PRAGMA page_count');
      return result.rows[0]?.page_count ?? 0;
    } catch {
      return 0;
    }
  }

  getPageSize(): number {
    try {
      const result = this.execute<{ page_size: number }>('PRAGMA page_size');
      return result.rows[0]?.page_size ?? 4096;
    } catch {
      return 4096;
    }
  }

  getFileSize(): number {
    return this.getPageCount() * this.getPageSize();
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.logger.log('SQLite database closed');
    }
  }

  isInitialized(): boolean {
    return this.db !== null;
  }
}
