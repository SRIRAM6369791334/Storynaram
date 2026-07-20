import { Injectable, Logger } from '@nestjs/common';
import { SQLiteConnection } from '../connection/sqlite-connection';
import type { QueryResult } from '../types';

@Injectable()
export class QueryExecutor {
  private readonly logger = new Logger(QueryExecutor.name);

  constructor(
    private readonly connection: SQLiteConnection,
  ) {}

  execute<T = Record<string, unknown>>(sql: string, params?: unknown[]): QueryResult<T> {
    return this.connection.execute<T>(sql, params);
  }

  executeBatch<T = Record<string, unknown>>(statements: Array<{ sql: string; params?: unknown[] }>): QueryResult<T>[] {
    return statements.map(stmt => this.execute<T>(stmt.sql, stmt.params));
  }

  executeInTransaction<T>(fn: (executor: QueryExecutor) => T): T {
    const db = this.connection.getDb();
    const txn = db.transaction(() => {
      const txnExecutor = new QueryExecutor(this.connection);
      return fn(txnExecutor);
    });
    return txn();
  }
}
