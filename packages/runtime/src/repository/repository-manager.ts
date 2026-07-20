import { Injectable, Logger } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import { RepositoryRegistry } from './repository-registry';
import type { RepositoryPort } from './repository-port';
import type { RepositoryTransaction, RepositoryStatistics } from './types';

@Injectable()
export class RepositoryManager {
  private readonly logger = new Logger(RepositoryManager.name);

  constructor(private readonly registry: RepositoryRegistry) {}

  getRepository<T extends { entityId: EntityId }>(entityType: string): RepositoryPort<T> {
    return this.registry.resolve<T>(entityType);
  }

  hasRepository(entityType: string): boolean {
    return this.registry.has(entityType);
  }

  async executeInTransaction<T>(
    entityType: string,
    operation: (repo: RepositoryPort<{ entityId: EntityId }>, tx: RepositoryTransaction) => Promise<T>,
  ): Promise<T> {
    const repo = this.registry.resolve(entityType);
    const tx = await repo.beginTransaction();
    this.registry.trackTransaction();
    try {
      await tx.begin();
      const result = await operation(repo, tx);
      await tx.commit();
      this.registry.completeTransaction();
      return result;
    } catch (error) {
      this.logger.error(`Transaction failed for ${entityType}, rolling back`, error);
      try {
        await tx.rollback();
      } catch (rollbackError) {
        this.logger.error(`Rollback also failed for ${entityType}`, rollbackError);
      }
      this.registry.completeTransaction();
      throw error;
    }
  }

  async executeAcrossRepositories<T>(
    operation: (repos: Map<string, RepositoryPort<any>>) => Promise<T>,
  ): Promise<T> {
    return operation(this.registry.getAll());
  }

  listRepositories(): string[] {
    return this.registry.list();
  }

  statistics(): RepositoryStatistics {
    return this.registry.statistics();
  }
}
