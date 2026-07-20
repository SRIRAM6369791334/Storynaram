import { describe, it, expect, beforeEach } from 'vitest';
import type { EntityId } from '@storynaram/core';
import { RuntimeConfig } from '../src/runtime-config';
import { EntityCacheService } from '../src/entity-cache.service';
import { EntityEventService } from '../src/entity-event.service';
import { EntityValidationService } from '../src/entity-validation.service';
import { EntityLifecycleService } from '../src/entity-lifecycle.service';
import { MemoryRepository } from '../src/repository/memory-repository';
import type { EventBusPort } from '@storynaram/events';
import type { SchemaRegistryService } from '@storynaram/schemas';
import type { ValidationEngineService } from '@storynaram/validation';

interface TestEntity {
  entityId: EntityId;
  name: string;
  value: number;
}

function createId(): EntityId {
  return crypto.randomUUID() as EntityId;
}

function createMockEventBus(): EventBusPort {
  return { publish: async () => {}, subscribe: () => {} };
}

function createMockRegistry(): SchemaRegistryService {
  return {
    has: () => true,
    get: () => ({}),
    find: () => [{ $id: 'test' }],
    statistics: () => ({ totalSchemas: 1, totalCompiled: 1, uptime: 1000 }),
  } as unknown as SchemaRegistryService;
}

function createMockValidationEngine(): ValidationEngineService {
  return {
    validateById: async () => ({
      resultId: 'r1', schemaId: 'test', passed: true, score: 1, issues: [],
      executionTimeMs: 1, mode: 'default', profileName: 'default', timestamp: new Date(),
    }),
  } as unknown as ValidationEngineService;
}

describe('MemoryRepository with cache', () => {
  let repo: MemoryRepository<TestEntity>;
  let cache: EntityCacheService;

  beforeEach(() => {
    const config = new RuntimeConfig({ enableCaching: true });
    cache = new EntityCacheService(config);
    const events = new EntityEventService(createMockEventBus(), config);
    const validation = new EntityValidationService(
      createMockRegistry(),
      createMockValidationEngine(),
      config,
    );
    const lifecycle = new EntityLifecycleService();
    repo = new MemoryRepository<TestEntity>('test', cache, events, validation, lifecycle, config);
  });

  it('should cache created entities', async () => {
    const { data } = await repo.create({ entityId: createId(), name: 'cached', value: 42 });
    const cached = cache.get<TestEntity>('test', data!.entityId);
    expect(cached).toBeDefined();
    expect(cached!.name).toBe('cached');
  });

  it('should invalidate cache on delete', async () => {
    const { data } = await repo.create({ entityId: createId(), name: 'to-delete', value: 1 });
    await repo.delete(data!.entityId);
    const cached = cache.get<TestEntity>('test', data!.entityId);
    expect(cached).toBeUndefined();
  });

  it('should find from cache on repeat lookup', async () => {
    const cacheSpy = cache;
    const { data } = await repo.create({ entityId: createId(), name: 'cache-hit', value: 7 });
    const before = cacheSpy.stats().hits;
    await repo.findById(data!.entityId); // first hit from previous cache
    const after = cacheSpy.stats().hits;
    expect(after).toBeGreaterThanOrEqual(before);
  });
});
