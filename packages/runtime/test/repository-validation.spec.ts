import { describe, it, expect, beforeEach, vi } from 'vitest';
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
    find: () => [{ $id: 'domain/Test.schema.json' }],
    statistics: () => ({ totalSchemas: 1, totalCompiled: 1, uptime: 1000 }),
  } as unknown as SchemaRegistryService;
}

describe('MemoryRepository with validation', () => {
  let repo: MemoryRepository<TestEntity>;
  let mockEngine: ValidationEngineService;

  beforeEach(() => {
    mockEngine = {
      validateById: vi.fn().mockResolvedValue({
        resultId: 'r1', schemaId: 'domain/Test.schema.json', passed: true, score: 1, issues: [],
        executionTimeMs: 1, mode: 'default', profileName: 'default', timestamp: new Date(),
      }),
    } as unknown as ValidationEngineService;

    const config = new RuntimeConfig({ enableValidation: true });
    const cache = new EntityCacheService(config);
    const events = new EntityEventService(createMockEventBus(), config);
    const validation = new EntityValidationService(createMockRegistry(), mockEngine, config);
    const lifecycle = new EntityLifecycleService();
    repo = new MemoryRepository<TestEntity>('test', cache, events, validation, lifecycle, config);
  });

  it('should validate on create', async () => {
    await repo.create({ entityId: createId(), name: 'valid', value: 1 });
    expect(mockEngine.validateById).toHaveBeenCalled();
  });

  it('should validate on update', async () => {
    const { data } = await repo.create({ entityId: createId(), name: 'valid', value: 1 });
    vi.clearAllMocks();
    await repo.update(data!.entityId, { value: 2 });
    expect(mockEngine.validateById).toHaveBeenCalled();
  });

  it('should fail create when validation fails', async () => {
    const failingEngine = {
      validateById: vi.fn().mockResolvedValue({
        resultId: 'r1', schemaId: 'domain/Test.schema.json', passed: false, score: 0,
        issues: [{ path: 'name', message: 'Name is required', severity: 'error' as const, code: 'required' }],
        executionTimeMs: 1, mode: 'default', profileName: 'default', timestamp: new Date(),
      }),
    } as unknown as ValidationEngineService;

    const config = new RuntimeConfig({ enableValidation: true });
    const cache = new EntityCacheService(config);
    const events = new EntityEventService(createMockEventBus(), config);
    const validation = new EntityValidationService(createMockRegistry(), failingEngine, config);
    const lifecycle = new EntityLifecycleService();
    const failingRepo = new MemoryRepository<TestEntity>('test', cache, events, validation, lifecycle, config);

    const result = await failingRepo.create({ entityId: createId(), name: 'bad', value: 0 });
    expect(result.success).toBe(false);
  });
});
