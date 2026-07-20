import { Injectable } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import { EntityCacheService } from '../entity-cache.service';
import { EntityEventService } from '../entity-event.service';
import { EntityValidationService } from '../entity-validation.service';
import { EntityLifecycleService } from '../entity-lifecycle.service';
import { RuntimeConfig } from '../runtime-config';
import { RepositoryRegistry } from './repository-registry';
import { MemoryRepository } from './memory-repository';
import type { RepositoryPort } from './repository-port';
import type { RepositoryOptions } from './types';

@Injectable()
export class RepositoryFactory {
  constructor(
    private readonly registry: RepositoryRegistry,
    private readonly cache?: EntityCacheService,
    private readonly events?: EntityEventService,
    private readonly validation?: EntityValidationService,
    private readonly lifecycle?: EntityLifecycleService,
    private readonly config?: RuntimeConfig,
  ) {}

  createMemoryRepository<T extends { entityId: EntityId }>(
    entityType: string,
    options?: RepositoryOptions,
  ): MemoryRepository<T> {
    const opts = { ...this.resolveDefaults(), ...options };
    const repo = new MemoryRepository<T>(
      entityType,
      opts.enableCache !== false ? this.cache : undefined,
      opts.enableEvents !== false ? this.events : undefined,
      opts.enableValidation !== false ? this.validation : undefined,
      this.lifecycle,
      this.config,
    );
    this.registry.register(entityType, repo);
    return repo;
  }

  register<T extends { entityId: EntityId }>(
    entityType: string,
    repository: RepositoryPort<T>,
  ): void {
    this.registry.register(entityType, repository);
  }

  private resolveDefaults(): RepositoryOptions {
    return {
      enableCache: this.config?.enableCaching ?? true,
      enableValidation: this.config?.enableValidation ?? true,
      enableEvents: this.config?.enableEvents ?? true,
      enableSoftDelete: this.config?.enableSoftDelete ?? true,
    };
  }
}
