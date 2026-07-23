import { Logger } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import { EntityCacheService } from '../entity-cache.service.js';
import { EntityEventService } from '../entity-event.service.js';
import { EntityValidationService } from '../entity-validation.service.js';
import { EntityLifecycleService } from '../entity-lifecycle.service.js';
import { RuntimeConfig } from '../runtime-config.js';
import { Specification } from './specification.js';
import type { StorageProvider } from './storage-provider.js';
import type { RepositoryPort } from './repository-port.js';
import {
  RepositoryNotFoundError,
  RepositoryConflictError,
} from './errors.js';
import type {
  Filter,
  PaginationInput,
  PaginatedResult,
  CursorInput,
  CursorResult,
  RepositoryResult,
  RepositoryBatchResult,
  RepositoryTransaction,
  Sort,
  UpsertOptions,
  BulkOperationResult,
} from './types.js';

export abstract class BaseRepository<T extends { entityId: EntityId }> implements RepositoryPort<T> {
  abstract readonly entityType: string;
  protected readonly logger: Logger;

  constructor(
    entityType: string,
    protected readonly storage: StorageProvider<T>,
    protected readonly cache?: EntityCacheService,
    protected readonly validation?: EntityValidationService,
    protected readonly events?: EntityEventService,
    protected readonly lifecycle?: EntityLifecycleService,
    protected readonly config?: RuntimeConfig,
  ) {
    this.logger = new Logger(`Repository(${entityType})`);
  }

  async create(data: Partial<T>): Promise<RepositoryResult<T>> {
    try {
      const processed = await this.runBeforeCreate(data);
      await this.runValidation(processed as Record<string, unknown>);
      const entity = await this.storage.create(processed as T);
      this.cacheEntity(entity);
      await this.runAfterCreate(entity);
      await this.emitEvent('created', entity.entityId, entity);
      return { success: true, data: entity };
    } catch (error) {
      return this.asErrorResult<T>(error);
    }
  }

  async insert(data: Partial<T>[]): Promise<RepositoryBatchResult<T>> {
    try {
      const entities: T[] = [];
      for (const item of data) {
        const processed = await this.runBeforeCreate(item);
        await this.runValidation(processed as Record<string, unknown>);
        const entity = await this.storage.create(processed as T);
        this.cacheEntity(entity);
        await this.runAfterCreate(entity);
        await this.emitEvent('created', entity.entityId, entity);
        entities.push(entity);
      }
      return { success: true, data: entities, count: entities.length };
    } catch (error) {
      return { success: false, error: error as Error, count: 0 };
    }
  }

  async save(data: Partial<T>): Promise<RepositoryResult<T>> {
    if (data.entityId && await this.storage.exists(data.entityId)) {
      return this.update(data.entityId, data);
    }
    return this.create(data);
  }

  async update(id: EntityId, data: Partial<T>): Promise<RepositoryResult<T>> {
    try {
      const existing = await this.storage.findById(id);
      if (!existing) {
        return { success: false, error: new RepositoryNotFoundError(this.entityType, id) };
      }
      const processed = await this.runBeforeUpdate(id, data);
      await this.runValidation({ ...existing, ...processed } as Record<string, unknown>, id);
      const updated = await this.storage.update(id, processed);
      this.cacheEntity(updated);
      await this.runAfterUpdate(updated);
      await this.emitEvent('updated', id, updated);
      return { success: true, data: updated };
    } catch (error) {
      return this.asErrorResult<T>(error);
    }
  }

  async delete(id: EntityId): Promise<RepositoryResult<void>> {
    try {
      const existing = await this.storage.findById(id);
      if (!existing) {
        return { success: false, error: new RepositoryNotFoundError(this.entityType, id) };
      }
      await this.runBeforeDelete(id);
      await this.storage.delete(id);
      this.invalidateCache(id);
      await this.runAfterDelete(id);
      await this.emitEvent('deleted', id, { entityId: id } as Partial<T>);
      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  async softDelete(id: EntityId): Promise<RepositoryResult<T>> {
    try {
      const existing = await this.storage.findById(id);
      if (!existing) {
        return { success: false, error: new RepositoryNotFoundError(this.entityType, id) };
      }
      await this.runBeforeSoftDelete(id);
      const deleted = await this.storage.softDelete(id);
      this.invalidateCache(id);
      await this.runAfterSoftDelete(deleted);
      await this.emitEvent('archived', id, { entityId: id } as Partial<T>);
      return { success: true, data: deleted };
    } catch (error) {
      return this.asErrorResult<T>(error);
    }
  }

  async restore(id: EntityId): Promise<RepositoryResult<T>> {
    try {
      const existing = await this.storage.findById(id);
      if (!existing) {
        return { success: false, error: new RepositoryNotFoundError(this.entityType, id) };
      }
      const restored = await this.storage.restore(id);
      this.invalidateCache(id);
      await this.emitEvent('restored', id, { entityId: id } as Partial<T>);
      return { success: true, data: restored };
    } catch (error) {
      return this.asErrorResult<T>(error);
    }
  }

  async exists(id: EntityId): Promise<boolean> {
    const cached = this.cache?.get<T>(this.entityType, id);
    if (cached) return true;
    return this.storage.exists(id);
  }

  async count(filter?: Filter<T>): Promise<number> {
    return this.storage.count(filter ?? {});
  }

  async findById(id: EntityId): Promise<RepositoryResult<T>> {
    try {
      const cached = this.cache?.get<T>(this.entityType, id);
      if (cached) {
        return { success: true, data: cached };
      }
      const entity = await this.storage.findById(id);
      if (!entity) {
        return { success: false, error: new RepositoryNotFoundError(this.entityType, id) };
      }
      this.cacheEntity(entity);
      return { success: true, data: entity };
    } catch (error) {
      return this.asErrorResult<T>(error);
    }
  }

  async findOne(filter?: Filter<T>): Promise<RepositoryResult<T>> {
    try {
      const entity = await this.storage.findOne(filter ?? {});
      if (!entity) {
        return { success: false, error: new RepositoryNotFoundError(this.entityType, 'unknown') };
      }
      return { success: true, data: entity };
    } catch (error) {
      return this.asErrorResult<T>(error);
    }
  }

  async findMany(filter?: Filter<T>): Promise<RepositoryBatchResult<T>> {
    try {
      const items = await this.storage.findMany(filter ?? {});
      return { success: true, data: items, count: items.length };
    } catch (error) {
      return { success: false, error: error as Error, count: 0 };
    }
  }

  async findAll(): Promise<RepositoryBatchResult<T>> {
    try {
      const items = await this.storage.findAll();
      return { success: true, data: items, count: items.length };
    } catch (error) {
      return { success: false, error: error as Error, count: 0 };
    }
  }

  async paginate(
    pagination: PaginationInput,
    filter?: Filter<T>,
    sort?: Sort<T>[],
  ): Promise<PaginatedResult<T>> {
    const sortMap: Record<string, 'asc' | 'desc'> = {};
    if (sort) {
      for (const s of sort) {
        sortMap[String(s.field)] = s.direction;
      }
    }
    return this.storage.paginate(pagination, filter, sortMap);
  }

  async cursor(
    input: CursorInput,
    filter?: Filter<T>,
    sort?: Sort<T>[],
  ): Promise<CursorResult<T>> {
    const sortMap: Record<string, 'asc' | 'desc'> = {};
    if (sort) {
      for (const s of sort) {
        sortMap[String(s.field)] = s.direction;
      }
    }
    return this.storage.cursor(input, filter, sortMap);
  }

  stream(filter?: Filter<T>): AsyncIterable<T> {
    return this.storage.stream(filter);
  }

  async findSatisfying(spec: Specification<T>): Promise<RepositoryBatchResult<T>> {
    try {
      const all = await this.storage.findAll();
      const filtered = all.filter(item => spec.satisfiedBy(item));
      return { success: true, data: filtered, count: filtered.length };
    } catch (error) {
      return { success: false, error: error as Error, count: 0 };
    }
  }

  async countSatisfying(spec: Specification<T>): Promise<number> {
    const all = await this.storage.findAll();
    return all.filter(item => spec.satisfiedBy(item)).length;
  }

  async upsert(options: UpsertOptions<T>): Promise<RepositoryResult<T>> {
    try {
      const existing = await this.storage.findOne(options.filter);
      if (existing) {
        return this.update(existing.entityId, options.updateData);
      }
      return this.create(options.insertData);
    } catch (error) {
      return this.asErrorResult<T>(error);
    }
  }

  async bulkDelete(ids: EntityId[]): Promise<BulkOperationResult> {
    const errors: { index: number; error: string }[] = [];
    let processed = 0;
    for (let i = 0; i < ids.length; i++) {
      try {
        const result = await this.delete(ids[i]!);
        if (result.success) {
          processed++;
        } else {
          errors.push({ index: i, error: result.error?.message ?? 'unknown' });
        }
      } catch (error) {
        errors.push({ index: i, error: String(error) });
      }
    }
    return {
      success: errors.length === 0,
      processedCount: processed,
      failedCount: errors.length,
      errors,
    };
  }

  async bulkUpdate(ids: EntityId[], data: Partial<T>): Promise<BulkOperationResult> {
    const errors: { index: number; error: string }[] = [];
    let processed = 0;
    for (let i = 0; i < ids.length; i++) {
      try {
        const result = await this.update(ids[i]!, data);
        if (result.success) {
          processed++;
        } else {
          errors.push({ index: i, error: result.error?.message ?? 'unknown' });
        }
      } catch (error) {
        errors.push({ index: i, error: String(error) });
      }
    }
    return {
      success: errors.length === 0,
      processedCount: processed,
      failedCount: errors.length,
      errors,
    };
  }

  async beginTransaction(): Promise<RepositoryTransaction> {
    return this.storage.beginTransaction();
  }

  supportsTransactions(): boolean {
    return this.storage.supportsTransactions();
  }

  protected async runValidation(data: Record<string, unknown>, entityId?: EntityId): Promise<void> {
    if (this.validation && this.config?.enableValidation !== false) {
      await this.validation.validateOrThrow(this.entityType, data, entityId);
    }
  }

  protected async runBeforeCreate(data: Partial<T>): Promise<Partial<T>> {
    if (this.lifecycle) {
      return this.lifecycle.runBeforeCreate(this.entityType, data);
    }
    return data;
  }

  protected async runAfterCreate(entity: T): Promise<void> {
    await this.lifecycle?.runAfterCreate(this.entityType, entity);
  }

  protected async runBeforeUpdate(id: EntityId, data: Partial<T>): Promise<Partial<T>> {
    if (this.lifecycle) {
      return this.lifecycle.runBeforeUpdate(this.entityType, id, data);
    }
    return data;
  }

  protected async runAfterUpdate(entity: T): Promise<void> {
    await this.lifecycle?.runAfterUpdate(this.entityType, entity);
  }

  protected async runBeforeDelete(id: EntityId): Promise<void> {
    await this.lifecycle?.runBeforeDelete(this.entityType, id);
  }

  protected async runAfterDelete(id: EntityId): Promise<void> {
    await this.lifecycle?.runAfterDelete(this.entityType, id);
  }

  protected async runBeforeSoftDelete(id: EntityId): Promise<void> {
    await this.lifecycle?.runBeforeSoftDelete(this.entityType, id);
  }

  protected async runAfterSoftDelete(entity: T): Promise<void> {
    await this.lifecycle?.runAfterSoftDelete(this.entityType, entity);
  }

  protected async emitEvent(
    eventType: 'created' | 'updated' | 'deleted' | 'restored' | 'archived',
    entityId: EntityId,
    data: Partial<T>,
  ): Promise<void> {
    if (this.events && this.config?.enableEvents !== false) {
      await this.events.emit(eventType, this.entityType, entityId, data);
    }
  }

  protected cacheEntity(entity: T): void {
    if (this.cache && this.config?.enableCaching !== false) {
      this.cache.set(this.entityType, entity.entityId, entity);
    }
  }

  protected invalidateCache(id: EntityId): void {
    this.cache?.invalidate(this.entityType, id);
  }

  protected asErrorResult<U>(error: unknown): RepositoryResult<U> {
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}
