import { Injectable, Logger } from '@nestjs/common';
import pg from 'pg';
import { v4 as uuid } from 'uuid';
import type { RepositoryTransaction, TransactionStatus } from '@storynaram/runtime';
import { ConnectionPool } from '../connection/connection-pool';
import { TransactionError } from '../errors';

class PostgresTransaction implements RepositoryTransaction {
  public readonly id: string;
  public status: TransactionStatus = 'pending';
  private savepointCounter = 0;
  private readonly savepoints: string[] = [];

  constructor(
    private readonly client: pg.PoolClient,
    private readonly logger: Logger,
  ) {
    this.id = uuid();
  }

  async begin(): Promise<void> {
    if (this.status !== 'pending') {
      throw new TransactionError(`Transaction ${this.id} already started`);
    }
    try {
      await this.client.query('BEGIN');
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
      await this.client.query('COMMIT');
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
        await this.client.query(`ROLLBACK TO SAVEPOINT "${sp}"`);
      }
      await this.client.query('ROLLBACK');
      this.status = 'rolled_back';
      this.logger.debug(`Transaction ${this.id} rolled back`);
    } catch (err) {
      throw new TransactionError(`Failed to rollback transaction: ${(err as Error).message}`);
    }
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  async createSavepoint(): Promise<string> {
    const name = `sp_${this.id.replace(/-/g, '_')}_${++this.savepointCounter}`;
    try {
      await this.client.query(`SAVEPOINT "${name}"`);
      this.savepoints.push(name);
      return name;
    } catch (err) {
      throw new TransactionError(`Failed to create savepoint: ${(err as Error).message}`);
    }
  }

  async rollbackToSavepoint(name: string): Promise<void> {
    try {
      await this.client.query(`ROLLBACK TO SAVEPOINT "${name}"`);
    } catch (err) {
      throw new TransactionError(`Failed to rollback to savepoint: ${(err as Error).message}`);
    }
  }

  async releaseSavepoint(name: string): Promise<void> {
    try {
      await this.client.query(`RELEASE SAVEPOINT "${name}"`);
      const idx = this.savepoints.indexOf(name);
      if (idx >= 0) {
        this.savepoints.splice(idx, 1);
      }
    } catch (err) {
      throw new TransactionError(`Failed to release savepoint: ${(err as Error).message}`);
    }
  }

  getClient(): pg.PoolClient {
    return this.client;
  }
}

@Injectable()
export class TransactionManager {
  private readonly logger = new Logger(TransactionManager.name);
  private readonly activeTransactions = new Map<string, PostgresTransaction>();

  constructor(private readonly pool: ConnectionPool) {}

  async beginTransaction(): Promise<RepositoryTransaction> {
    const client = await this.pool.acquireClient();
    try {
      const txn = new PostgresTransaction(client, this.logger);
      await txn.begin();
      this.activeTransactions.set(txn.id, txn);
      return txn;
    } catch (err) {
      client.release();
      throw err;
    }
  }

  async commitTransaction(txn: RepositoryTransaction): Promise<void> {
    if (!(txn instanceof PostgresTransaction)) {
      throw new TransactionError('Invalid transaction type');
    }
    try {
      await txn.commit();
    } finally {
      this.activeTransactions.delete(txn.id);
      txn.getClient().release();
    }
  }

  async rollbackTransaction(txn: RepositoryTransaction): Promise<void> {
    if (!(txn instanceof PostgresTransaction)) {
      throw new TransactionError('Invalid transaction type');
    }
    try {
      await txn.rollback();
    } finally {
      this.activeTransactions.delete(txn.id);
      txn.getClient().release();
    }
  }

  getActiveCount(): number {
    return this.activeTransactions.size;
  }

  supportsNestedTransactions(): boolean {
    return true;
  }
}
