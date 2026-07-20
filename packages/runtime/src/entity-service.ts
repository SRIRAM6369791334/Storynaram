import { Logger } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import { EntityNotFoundError, EntityOperationError } from './errors';
import { EntityCacheService } from './entity-cache.service';
import { EntityEventService } from './entity-event.service';
import { EntityValidationService } from './entity-validation.service';
import { EntityLifecycleService } from './entity-lifecycle.service';
import { RuntimeConfig } from './runtime-config';
import type { EntityFilter, EntityPage } from './types';

export abstract class EntityService<T extends { entityId: EntityId }> {
  protected readonly logger: Logger;

  constructor(
    protected readonly entityType: string,
    protected readonly cache: EntityCacheService,
    protected readonly events: EntityEventService,
    protected readonly validation: EntityValidationService,
    protected readonly lifecycle: EntityLifecycleService,
    protected readonly config: RuntimeConfig,
  ) {
    this.logger = new Logger(`EntityService(${entityType})`);
  }

  abstract create(data: Partial<T>): Promise<T>;

  abstract findById(id: EntityId): Promise<T | undefined>;

  abstract findMany(filter?: EntityFilter): Promise<EntityPage<T>>;

  abstract update(id: EntityId, data: Partial<T>): Promise<T>;

  abstract delete(id: EntityId): Promise<void>;

  async findByOrThrow(id: EntityId): Promise<T> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new EntityNotFoundError(this.entityType, id);
    }
    return entity;
  }

  async softDelete(id: EntityId): Promise<T> {
    await this.lifecycle.runBeforeSoftDelete(this.entityType, id);
    const entity = await this.findByOrThrow(id);
    const deleted = await this.performSoftDelete(entity);
    this.cache.invalidate(this.entityType, id);
    await this.lifecycle.runAfterSoftDelete(this.entityType, deleted);
    await this.events.emit('archived', this.entityType, id, { entityId: id });
    return deleted;
  }

  async restore(id: EntityId): Promise<T> {
    const entity = await this.findByOrThrow(id);
    const restored = await this.performRestore(entity);
    this.cache.invalidate(this.entityType, id);
    await this.events.emit('restored', this.entityType, id, { entityId: id });
    return restored;
  }

  protected async validateData(data: Partial<T>, entityId?: EntityId): Promise<void> {
    await this.validation.validateOrThrow(this.entityType, data as Record<string, unknown>, entityId);
  }

  protected async emitEvent(
    eventType: 'created' | 'updated' | 'deleted' | 'restored' | 'archived',
    entityId: EntityId,
    data: Partial<T>,
  ): Promise<void> {
    await this.events.emit(eventType, this.entityType, entityId, data);
  }

  protected async getCached(id: EntityId): Promise<T | undefined> {
    return this.cache.get<T>(this.entityType, id);
  }

  protected async setCached(id: EntityId, entity: T): Promise<void> {
    this.cache.set(this.entityType, id, entity);
  }

  protected async invalidateCache(id: EntityId): Promise<void> {
    this.cache.invalidate(this.entityType, id);
  }

  protected async runCreateHooks(data: Partial<T>): Promise<Partial<T>> {
    return this.lifecycle.runBeforeCreate(this.entityType, data);
  }

  protected async runAfterCreateHooks(entity: T): Promise<void> {
    await this.lifecycle.runAfterCreate(this.entityType, entity);
  }

  protected async runUpdateHooks(id: EntityId, data: Partial<T>): Promise<Partial<T>> {
    return this.lifecycle.runBeforeUpdate(this.entityType, id, data);
  }

  protected async runAfterUpdateHooks(entity: T): Promise<void> {
    await this.lifecycle.runAfterUpdate(this.entityType, entity);
  }

  protected async runDeleteHooks(id: EntityId): Promise<void> {
    await this.lifecycle.runBeforeDelete(this.entityType, id);
  }

  protected async runAfterDeleteHooks(id: EntityId): Promise<void> {
    await this.lifecycle.runAfterDelete(this.entityType, id);
  }

  protected abstract performSoftDelete(entity: T): Promise<T>;

  protected abstract performRestore(entity: T): Promise<T>;
}
