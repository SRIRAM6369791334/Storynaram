import { Injectable, Logger } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import type { RepositoryPort } from './repository-port';
import { RepositoryConfigurationError } from './errors';
import type { RepositoryStatistics } from './types';

@Injectable()
export class RepositoryRegistry {
  private readonly logger = new Logger(RepositoryRegistry.name);
  private readonly repositories = new Map<string, RepositoryPort<any>>();
  private totalTransactions = 0;
  private activeTransactions = 0;

  register<T extends { entityId: EntityId }>(entityType: string, repository: RepositoryPort<T>): void {
    if (this.repositories.has(entityType)) {
      this.logger.warn(`Repository for ${entityType} already registered, overwriting`);
    }
    this.repositories.set(entityType, repository);
    this.logger.log(`Repository registered for ${entityType}`);
  }

  unregister(entityType: string): boolean {
    const removed = this.repositories.delete(entityType);
    if (removed) {
      this.logger.log(`Repository unregistered for ${entityType}`);
    }
    return removed;
  }

  resolve<T extends { entityId: EntityId }>(entityType: string): RepositoryPort<T> {
    const repo = this.repositories.get(entityType);
    if (!repo) {
      throw new RepositoryConfigurationError(`No repository registered for entity type: ${entityType}`);
    }
    return repo as RepositoryPort<T>;
  }

  has(entityType: string): boolean {
    return this.repositories.has(entityType);
  }

  list(): string[] {
    return Array.from(this.repositories.keys());
  }

  getAll(): Map<string, RepositoryPort<any>> {
    return new Map(this.repositories);
  }

  trackTransaction(): void {
    this.totalTransactions++;
    this.activeTransactions++;
  }

  completeTransaction(): void {
    this.activeTransactions = Math.max(0, this.activeTransactions - 1);
  }

  statistics(): RepositoryStatistics {
    const reposByType: Record<string, number> = {};
    for (const key of this.repositories.keys()) {
      reposByType[key] = 1;
    }
    return {
      totalRepositories: this.repositories.size,
      totalEntities: 0,
      repositoriesByType: reposByType,
      cacheHitRate: 0,
      totalTransactions: this.totalTransactions,
      activeTransactions: this.activeTransactions,
    };
  }
}
