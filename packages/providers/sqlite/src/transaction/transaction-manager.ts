import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { RepositoryTransaction, TransactionStatus } from '@storynaram/runtime';
import { SQLiteConnection } from '../connection/sqlite-connection';
import { TransactionError } from '../errors';

class SQLiteTransaction implements RepositoryTransaction {
  public readonly id: string;
  public status: TransactionStatus = 'pending';
  private savepointCounter = 0;
  private readonly savepoints: string[] = [];

  constructor(
    private readonly connection: SQLiteConnection,
    private readonly logger: Logger,
  ) {
    this.id = uuid();
  }

  async begin(): Promise<void> {
    if (this.status !== 'pending') {
      throw new TransactionError(`Transaction ${this.id} already started`);
    }
    try {
      this.connection.execute('BEGIN IMMEDIATE');
      this.status = 'active';
      this.logger.debug(`Transaction ${this.id} started`);
    } catch (err) {
      throw new TransactionError(`Failed to begin transaction: ${(err as Error).message}`);
    }
  }

  async commit(): Promise<void> {
    if (this.status !== 'active') {
      throw new TransactionError(`Transaction ${this.id} cannot commit (status: ${this.status})`);
    }
    try {
      this.connection.execute('COMMIT');
      this.status = 'committed';
      this.logger.debug(`Transaction ${this.id} committed`);
    } catch (err) {
      throw new TransactionError(`Failed to commit transaction: ${(err as Error).message}`);
    }
  }

  async rollback(): Promise<void> {
    if (this.status !== 'active') {
      throw new TransactionError(`Transaction ${this.id} cannot rollback (status: ${this.status})`);
    }
    try {
      while (this.savepoints.length > 0) {
        const sp = this.savepoints.pop()!;
        this.connection.execute(`ROLLBACK TO "${sp}"`);
      }
      this.connection.execute('ROLLBACK');
      this.status = 'rolled_back';
      this.logger.debug(`Transaction ${this.id} rolled back`);
    } catch (err) {
      throw new TransactionError(`Failed to rollback transaction: ${(err as Error).message}`);
    }
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  createSavepoint(): string {
    const name = `sp_${this.id.replace(/-/g, '_')}_${++this.savepointCounter}`;
    try {
      this.connection.execute(`SAVEPOINT "${name}"`);
      this.savepoints.push(name);
      return name;
    } catch (err) {
      throw new TransactionError(`Failed to create savepoint: ${(err as Error).message}`);
    }
  }

  rollbackToSavepoint(name: string): void {
    try {
      this.connection.execute(`ROLLBACK TO "${name}"`);
    } catch (err) {
      throw new TransactionError(`Failed to rollback to savepoint: ${(err as Error).message}`);
    }
  }

  releaseSavepoint(name: string): void {
    try {
      this.connection.execute(`RELEASE "${name}"`);
      const idx = this.savepoints.indexOf(name);
      if (idx >= 0) {
        this.savepoints.splice(idx, 1);
      }
    } catch (err) {
      throw new TransactionError(`Failed to release savepoint: ${(err as Error).message}`);
    }
  }
}

@Injectable()
export class TransactionManager {
  private readonly logger = new Logger(TransactionManager.name);
  private readonly activeTransactions = new Map<string, SQLiteTransaction>();

  constructor(private readonly connection: SQLiteConnection) {}

  async beginTransaction(): Promise<RepositoryTransaction> {
    const txn = new SQLiteTransaction(this.connection, this.logger);
    await txn.begin();
    this.activeTransactions.set(txn.id, txn);
    return txn;
  }

  async commitTransaction(txn: RepositoryTransaction): Promise<void> {
    if (!(txn instanceof SQLiteTransaction)) {
      throw new TransactionError('Invalid transaction type');
    }
    try {
      await txn.commit();
    } finally {
      this.activeTransactions.delete(txn.id);
    }
  }

  async rollbackTransaction(txn: RepositoryTransaction): Promise<void> {
    if (!(txn instanceof SQLiteTransaction)) {
      throw new TransactionError('Invalid transaction type');
    }
    try {
      await txn.rollback();
    } finally {
      this.activeTransactions.delete(txn.id);
    }
  }

  getActiveCount(): number {
    return this.activeTransactions.size;
  }

  supportsNestedTransactions(): boolean {
    return true;
  }
}
