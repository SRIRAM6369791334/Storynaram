import { Logger } from '@nestjs/common';
import type { RepositoryTransaction, TransactionStatus, RepositoryTransactionOptions } from './types.js';
import { RepositoryTransactionError } from './errors.js';

export class DefaultTransaction implements RepositoryTransaction {
  readonly id: string;
  status: TransactionStatus = 'pending';
  private readonly logger = new Logger(DefaultTransaction.name);
  private readonly timeoutMs: number;
  private timeoutHandle?: ReturnType<typeof setTimeout>;
  private readonly startedAt: number;

  constructor(
    private readonly commitFn: () => Promise<void>,
    private readonly rollbackFn: () => Promise<void>,
    options?: RepositoryTransactionOptions,
  ) {
    this.id = crypto.randomUUID();
    this.timeoutMs = options?.timeoutMs ?? 30000;
    this.startedAt = Date.now();
  }

  async begin(): Promise<void> {
    if (this.status !== 'pending') {
      throw new RepositoryTransactionError('transaction', this.id, `Cannot begin transaction in state: ${this.status}`);
    }
    this.status = 'active';
    this.timeoutHandle = setTimeout(() => {
      if (this.status === 'active') {
        this.logger.warn(`Transaction ${this.id} timed out after ${String(this.timeoutMs)}ms`);
        this.rollback().catch(e => this.logger.error('Rollback on timeout failed', e));
      }
    }, this.timeoutMs).unref();
    this.logger.debug(`Transaction ${this.id} started`);
  }

  async commit(): Promise<void> {
    if (this.status !== 'active') {
      throw new RepositoryTransactionError('transaction', this.id, `Cannot commit transaction in state: ${this.status}`);
    }
    this.clearTimeout();
    try {
      await this.commitFn();
      this.status = 'committed';
      this.logger.debug(`Transaction ${this.id} committed (${String(Date.now() - this.startedAt)}ms)`);
    } catch (error) {
      this.status = 'rolled_back';
      this.logger.error(`Transaction ${this.id} commit failed, rolled back`, error);
      throw new RepositoryTransactionError('transaction', this.id, `Commit failed: ${String(error)}`);
    }
  }

  async rollback(): Promise<void> {
    if (this.status !== 'active' && this.status !== 'pending') {
      return;
    }
    this.clearTimeout();
    try {
      await this.rollbackFn();
      this.status = 'rolled_back';
      this.logger.debug(`Transaction ${this.id} rolled back`);
    } catch (error) {
      this.logger.error(`Transaction ${this.id} rollback failed`, error);
      throw new RepositoryTransactionError('transaction', this.id, `Rollback failed: ${String(error)}`);
    }
  }

  isActive(): boolean {
    return this.status === 'active' && (Date.now() - this.startedAt) < this.timeoutMs;
  }

  private clearTimeout(): void {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = undefined;
    }
  }
}
