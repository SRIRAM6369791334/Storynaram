import { Injectable, Logger } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import { RepositoryRegistry } from './repository-registry.js';
import { RepositoryManager } from './repository-manager.js';
import type { RepositoryPort } from './repository-port.js';
import type { RepositoryTransaction } from './types.js';

@Injectable()
export class RepositoryContext {
  private readonly logger = new Logger(RepositoryContext.name);
  private readonly localRepositories = new Map<string, RepositoryPort<any>>();
  private currentTransaction?: RepositoryTransaction;
  private inTransaction = false;

  constructor(
    private readonly registry: RepositoryRegistry,
    private readonly manager: RepositoryManager,
  ) {}

  register<T extends { entityId: EntityId }>(entityType: string, repository: RepositoryPort<T>): void {
    this.localRepositories.set(entityType, repository);
  }

  getRepository<T extends { entityId: EntityId }>(entityType: string): RepositoryPort<T> {
    const local = this.localRepositories.get(entityType);
    if (local) return local as RepositoryPort<T>;
    return this.manager.getRepository<T>(entityType);
  }

  hasRepository(entityType: string): boolean {
    return this.localRepositories.has(entityType) || this.manager.hasRepository(entityType);
  }

  async beginTransaction(): Promise<RepositoryTransaction> {
    if (this.inTransaction) {
      this.logger.warn('Transaction already active in context');
    }
    const anyRepo = this.localRepositories.values().next().value ?? this.registry.resolve('__any__');
    this.currentTransaction = await anyRepo.beginTransaction();
    this.inTransaction = true;
    return this.currentTransaction;
  }

  async commit(): Promise<void> {
    if (!this.currentTransaction) {
      this.logger.warn('No active transaction to commit');
      return;
    }
    await this.currentTransaction.commit();
    this.inTransaction = false;
    this.currentTransaction = undefined;
  }

  async rollback(): Promise<void> {
    if (!this.currentTransaction) {
      this.logger.warn('No active transaction to rollback');
      return;
    }
    await this.currentTransaction.rollback();
    this.inTransaction = false;
    this.currentTransaction = undefined;
  }

  isInTransaction(): boolean {
    return this.inTransaction;
  }
}
