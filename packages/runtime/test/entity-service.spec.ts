import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RuntimeConfig } from '../src/runtime-config';
import { EntityCacheService } from '../src/entity-cache.service';
import { EntityEventService } from '../src/entity-event.service';
import { EntityValidationService } from '../src/entity-validation.service';
import { EntityLifecycleService } from '../src/entity-lifecycle.service';
import { EntityService } from '../src/entity-service';
import type { EntityId } from '@storynaram/core';
import type { EventBusPort } from '@storynaram/events';
import type { SchemaRegistryService } from '@storynaram/schemas';
import type { ValidationEngineService } from '@storynaram/validation';
import type { EntityFilter, EntityPage } from '../src/types';
import { EntityNotFoundError } from '../src/errors';

interface TestEntity {
  entityId: EntityId;
  name: string;
  value: number;
  deletedAt?: Date | null;
}

class ConcreteEntityService extends EntityService<TestEntity> {
  private store = new Map<string, TestEntity>();

  constructor(
    cache: EntityCacheService,
    events: EntityEventService,
    validation: EntityValidationService,
    lifecycle: EntityLifecycleService,
    config: RuntimeConfig,
  ) {
    super('test', cache, events, validation, lifecycle, config);
  }

  async create(data: Partial<TestEntity>): Promise<TestEntity> {
    const processed = await this.runCreateHooks(data);
    await this.validateData(processed);
    const entity: TestEntity = {
      entityId: crypto.randomUUID() as EntityId,
      name: processed.name ?? '',
      value: processed.value ?? 0,
    };
    this.store.set(entity.entityId, entity);
    await this.runAfterCreateHooks(entity);
    this.setCached(entity.entityId, entity);
    await this.emitEvent('created', entity.entityId, entity);
    return entity;
  }

  async findById(id: EntityId): Promise<TestEntity | undefined> {
    const cached = await this.getCached(id);
    if (cached) return cached;
    return this.store.get(id);
  }

  async findMany(filter?: EntityFilter): Promise<EntityPage<TestEntity>> {
    let items = Array.from(this.store.values());
    const limit = filter?.limit ?? 10;
    const offset = filter?.offset ?? 0;
    const total = items.length;
    items = items.slice(offset, offset + limit);
    return { items, total, offset, limit };
  }

  async update(id: EntityId, data: Partial<TestEntity>): Promise<TestEntity> {
    const existing = this.store.get(id);
    if (!existing) throw new EntityNotFoundError(this.entityType, id);
    const processed = await this.runUpdateHooks(id, data);
    await this.validateData(processed, id);
    const updated = { ...existing, ...processed };
    this.store.set(id, updated);
    await this.runAfterUpdateHooks(updated);
    this.setCached(id, updated);
    await this.emitEvent('updated', id, updated);
    return updated;
  }

  async delete(id: EntityId): Promise<void> {
    await this.runDeleteHooks(id);
    const existing = this.store.get(id);
    if (!existing) throw new EntityNotFoundError(this.entityType, id);
    this.store.delete(id);
    await this.runAfterDeleteHooks(id);
    this.invalidateCache(id);
    await this.emitEvent('deleted', id, { entityId: id });
  }

  protected async performSoftDelete(entity: TestEntity): Promise<TestEntity> {
    const deleted = { ...entity, deletedAt: new Date() };
    this.store.set(entity.entityId, deleted);
    return deleted;
  }

  protected async performRestore(entity: TestEntity): Promise<TestEntity> {
    const restored = { ...entity, deletedAt: null };
    this.store.set(entity.entityId, restored);
    return restored;
  }
}

function createMockEventBus(): EventBusPort {
  return {
    publish: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn(),
  };
}

function createMockValidationEngine(): ValidationEngineService {
  return {
    validateById: vi.fn().mockResolvedValue({
      resultId: crypto.randomUUID(),
      schemaId: 'domain/Test.schema.json',
      passed: true,
      score: 1,
      issues: [],
      executionTimeMs: 5,
      mode: 'default',
      profileName: 'default',
      timestamp: new Date(),
    }),
  } as unknown as ValidationEngineService;
}

function createMockSchemaRegistry(): SchemaRegistryService {
  return {
    has: vi.fn().mockReturnValue(true),
    get: vi.fn().mockReturnValue({}),
    find: vi.fn().mockReturnValue([{ $id: 'domain/Test.schema.json' }]),
    statistics: vi.fn().mockReturnValue({ totalSchemas: 1, totalCompiled: 1, uptime: 1000 }),
  } as unknown as SchemaRegistryService;
}

describe('EntityService', () => {
  let service: ConcreteEntityService;
  let cache: EntityCacheService;
  let validation: EntityValidationService;
  let lifecycle: EntityLifecycleService;
  let eventBus: EventBusPort;
  let config: RuntimeConfig;

  beforeEach(() => {
    config = new RuntimeConfig({ enableValidation: true, enableEvents: true, enableCaching: true });
    cache = new EntityCacheService(config);
    eventBus = createMockEventBus();
    const events = new EntityEventService(eventBus, config);
    const registry = createMockSchemaRegistry();
    const engine = createMockValidationEngine();
    validation = new EntityValidationService(registry, engine, config);
    lifecycle = new EntityLifecycleService();
    service = new ConcreteEntityService(cache, events, validation, lifecycle, config);
  });

  describe('create', () => {
    it('should create an entity', async () => {
      const entity = await service.create({ name: 'test-1', value: 42 });
      expect(entity.entityId).toBeTruthy();
      expect(entity.name).toBe('test-1');
      expect(entity.value).toBe(42);
    });
  });

  describe('findById', () => {
    it('should find a created entity by id', async () => {
      const created = await service.create({ name: 'find-me', value: 1 });
      const found = await service.findById(created.entityId);
      expect(found).toBeTruthy();
      expect(found?.name).toBe('find-me');
    });

    it('should return undefined for non-existent entity', async () => {
      const result = await service.findById('non_existent' as EntityId);
      expect(result).toBeUndefined();
    });
  });

  describe('findByOrThrow', () => {
    it('should throw EntityNotFoundError for non-existent entity', async () => {
      await expect(service.findByOrThrow('nope' as EntityId)).rejects.toThrow(EntityNotFoundError);
    });

    it('should return entity if found', async () => {
      const created = await service.create({ name: 'throw-test', value: 2 });
      const found = await service.findByOrThrow(created.entityId);
      expect(found.name).toBe('throw-test');
    });
  });

  describe('findMany', () => {
    it('should return all entities', async () => {
      await service.create({ name: 'a', value: 1 });
      await service.create({ name: 'b', value: 2 });
      const page = await service.findMany();
      expect(page.items.length).toBe(2);
      expect(page.total).toBe(2);
    });

    it('should respect limit and offset', async () => {
      await service.create({ name: 'a', value: 1 });
      await service.create({ name: 'b', value: 2 });
      await service.create({ name: 'c', value: 3 });
      const page = await service.findMany({ limit: 2, offset: 0 });
      expect(page.items.length).toBe(2);
      expect(page.total).toBe(3);
    });
  });

  describe('update', () => {
    it('should update an entity', async () => {
      const created = await service.create({ name: 'original', value: 0 });
      const updated = await service.update(created.entityId, { value: 100 });
      expect(updated.value).toBe(100);
      expect(updated.name).toBe('original');
    });

    it('should throw for non-existent entity', async () => {
      await expect(service.update('missing' as EntityId, { name: 'x' })).rejects.toThrow(
        EntityNotFoundError,
      );
    });
  });

  describe('delete', () => {
    it('should delete an entity', async () => {
      const created = await service.create({ name: 'delete-me', value: 0 });
      await service.delete(created.entityId);
      const found = await service.findById(created.entityId);
      expect(found).toBeUndefined();
    });

    it('should throw for non-existent entity', async () => {
      await expect(service.delete('missing' as EntityId)).rejects.toThrow(EntityNotFoundError);
    });
  });

  describe('softDelete and restore', () => {
    it('should soft delete an entity', async () => {
      const created = await service.create({ name: 'soft', value: 1 });
      const deleted = await service.softDelete(created.entityId);
      expect(deleted.deletedAt).toBeInstanceOf(Date);
    });

    it('should restore a soft-deleted entity', async () => {
      const created = await service.create({ name: 'restore-me', value: 2 });
      await service.softDelete(created.entityId);
      const restored = await service.restore(created.entityId);
      expect(restored.deletedAt).toBeNull();
    });
  });

  describe('lifecycle hooks', () => {
    it('should run beforeCreate hook', async () => {
      lifecycle.register<TestEntity>('test', {
        beforeCreate: (data) => ({ ...data, value: 999 }),
      });
      const entity = await service.create({ name: 'hook-test', value: 1 });
      expect(entity.value).toBe(999);
    });

    it('should run afterCreate hook', async () => {
      let afterCreated = false;
      lifecycle.register<TestEntity>('test', {
        afterCreate: () => { afterCreated = true; },
      });
      await service.create({ name: 'after-test', value: 1 });
      expect(afterCreated).toBe(true);
    });

    it('should run beforeUpdate hook', async () => {
      lifecycle.register<TestEntity>('test', {
        beforeUpdate: (_id, data) => ({ ...data, name: 'overridden' }),
      });
      const created = await service.create({ name: 'original', value: 1 });
      const updated = await service.update(created.entityId, { name: 'new-name' });
      expect(updated.name).toBe('overridden');
    });
  });

  describe('cache', () => {
    it('should cache created entities', async () => {
      const entity = await service.create({ name: 'cache-test', value: 7 });
      const cached = cache.get<TestEntity>('test', entity.entityId);
      expect(cached).toBeTruthy();
      expect(cached?.name).toBe('cache-test');
    });

    it('should invalidate cache on delete', async () => {
      const entity = await service.create({ name: 'cache-del', value: 0 });
      await service.delete(entity.entityId);
      const cached = cache.get<TestEntity>('test', entity.entityId);
      expect(cached).toBeUndefined();
    });
  });
});
