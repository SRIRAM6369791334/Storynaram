import { describe, it, expect, beforeEach } from 'vitest';
import type { EntityId } from '@storynaram/core';
import { MemoryRepository } from '../src/repository/memory-repository';
import { RepositoryNotFoundError, RepositoryConflictError } from '../src/repository/errors';
import type { Filter, Sort } from '../src/repository/types';

interface TestEntity {
  entityId: EntityId;
  name: string;
  value: number;
  deletedAt?: Date | null;
}

function createId(): EntityId {
  return crypto.randomUUID() as EntityId;
}

describe('MemoryRepository CRUD', () => {
  let repo: MemoryRepository<TestEntity>;

  beforeEach(() => {
    repo = new MemoryRepository<TestEntity>('test');
  });

  describe('create', () => {
    it('should create an entity', async () => {
      const result = await repo.create({ entityId: createId(), name: 'test-1', value: 42 });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.name).toBe('test-1');
    });

    it('should fail on duplicate id', async () => {
      const id = createId();
      await repo.create({ entityId: id, name: 'first', value: 1 });
      const result = await repo.create({ entityId: id, name: 'second', value: 2 });
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(RepositoryConflictError);
    });
  });

  describe('findById', () => {
    it('should find an entity by id', async () => {
      const { data } = await repo.create({ entityId: createId(), name: 'find-me', value: 1 });
      const result = await repo.findById(data!.entityId);
      expect(result.success).toBe(true);
      expect(result.data!.name).toBe('find-me');
    });

    it('should return error for non-existent id', async () => {
      const result = await repo.findById('nonexistent' as EntityId);
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(RepositoryNotFoundError);
    });
  });

  describe('update', () => {
    it('should update an entity', async () => {
      const { data } = await repo.create({ entityId: createId(), name: 'original', value: 0 });
      const result = await repo.update(data!.entityId, { value: 100 });
      expect(result.success).toBe(true);
      expect(result.data!.value).toBe(100);
      expect(result.data!.name).toBe('original');
    });

    it('should return error for non-existent entity', async () => {
      const result = await repo.update('missing' as EntityId, { name: 'x' });
      expect(result.success).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete an entity', async () => {
      const { data } = await repo.create({ entityId: createId(), name: 'delete-me', value: 0 });
      const result = await repo.delete(data!.entityId);
      expect(result.success).toBe(true);
      const found = await repo.findById(data!.entityId);
      expect(found.success).toBe(false);
    });
  });

  describe('softDelete and restore', () => {
    it('should soft delete and restore', async () => {
      const { data } = await repo.create({ entityId: createId(), name: 'soft', value: 1 });
      const deleted = await repo.softDelete(data!.entityId);
      expect(deleted.success).toBe(true);
      expect(deleted.data!.deletedAt).toBeTruthy();

      const restored = await repo.restore(data!.entityId);
      expect(restored.success).toBe(true);
      expect(restored.data!.deletedAt).toBeNull();
    });
  });

  describe('exists', () => {
    it('should return true for existing entity', async () => {
      const { data } = await repo.create({ entityId: createId(), name: 'exists', value: 1 });
      const exists = await repo.exists(data!.entityId);
      expect(exists).toBe(true);
    });

    it('should return false for non-existing entity', async () => {
      const exists = await repo.exists('missing' as EntityId);
      expect(exists).toBe(false);
    });
  });

  describe('count', () => {
    it('should count entities', async () => {
      await repo.create({ entityId: createId(), name: 'a', value: 1 });
      await repo.create({ entityId: createId(), name: 'b', value: 2 });
      const count = await repo.count();
      expect(count).toBe(2);
    });

    it('should count with filter', async () => {
      await repo.create({ entityId: createId(), name: 'a', value: 1 });
      await repo.create({ entityId: createId(), name: 'b', value: 2 });
      const filter: Filter<TestEntity> = { conditions: [{ field: 'name', operator: 'eq', value: 'a' }] };
      const count = await repo.count(filter);
      expect(count).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should return all entities', async () => {
      await repo.create({ entityId: createId(), name: 'a', value: 1 });
      await repo.create({ entityId: createId(), name: 'b', value: 2 });
      const result = await repo.findAll();
      expect(result.success).toBe(true);
      expect(result.data!.length).toBe(2);
    });
  });

  describe('findMany with filter', () => {
    it('should filter by condition', async () => {
      await repo.create({ entityId: createId(), name: 'cat', value: 10 });
      await repo.create({ entityId: createId(), name: 'dog', value: 20 });
      const filter: Filter<TestEntity> = { conditions: [{ field: 'name', operator: 'eq', value: 'cat' }] };
      const result = await repo.findMany(filter);
      expect(result.data!.length).toBe(1);
      expect(result.data![0]!.name).toBe('cat');
    });

    it('should support gt operator', async () => {
      await repo.create({ entityId: createId(), name: 'a', value: 5 });
      await repo.create({ entityId: createId(), name: 'b', value: 15 });
      const filter: Filter<TestEntity> = { conditions: [{ field: 'value', operator: 'gt', value: 10 }] };
      const result = await repo.findMany(filter);
      expect(result.data!.length).toBe(1);
      expect(result.data![0]!.name).toBe('b');
    });

    it('should support or conditions', async () => {
      await repo.create({ entityId: createId(), name: 'alpha', value: 1 });
      await repo.create({ entityId: createId(), name: 'beta', value: 2 });
      await repo.create({ entityId: createId(), name: 'gamma', value: 3 });
      const filter: Filter<TestEntity> = {
        or: [
          { conditions: [{ field: 'name', operator: 'eq', value: 'alpha' }] },
          { conditions: [{ field: 'name', operator: 'eq', value: 'beta' }] },
        ],
      };
      const result = await repo.findMany(filter);
      expect(result.data!.length).toBe(2);
    });

    it('should support contains operator', async () => {
      await repo.create({ entityId: createId(), name: 'hello world', value: 1 });
      await repo.create({ entityId: createId(), name: 'goodbye', value: 2 });
      const filter: Filter<TestEntity> = { conditions: [{ field: 'name', operator: 'contains', value: 'hello' }] };
      const result = await repo.findMany(filter);
      expect(result.data!.length).toBe(1);
    });
  });

  describe('save (upsert)', () => {
    it('should create if not exists', async () => {
      const result = await repo.save({ entityId: createId(), name: 'new', value: 1 });
      expect(result.success).toBe(true);
    });

    it('should update if exists', async () => {
      const id = createId();
      await repo.create({ entityId: id, name: 'original', value: 0 });
      const result = await repo.save({ entityId: id, name: 'original', value: 999 });
      expect(result.success).toBe(true);
      expect(result.data!.value).toBe(999);
    });
  });

  describe('bulk operations', () => {
    it('should bulk delete', async () => {
      const e1 = (await repo.create({ entityId: createId(), name: 'a', value: 1 })).data!;
      const e2 = (await repo.create({ entityId: createId(), name: 'b', value: 2 })).data!;
      const result = await repo.bulkDelete([e1.entityId, e2.entityId]);
      expect(result.processedCount).toBe(2);
      expect(result.failedCount).toBe(0);
    });

    it('should bulk update', async () => {
      const e1 = (await repo.create({ entityId: createId(), name: 'a', value: 1 })).data!;
      const e2 = (await repo.create({ entityId: createId(), name: 'b', value: 2 })).data!;
      const result = await repo.bulkUpdate([e1.entityId, e2.entityId], { value: 99 });
      expect(result.processedCount).toBe(2);
      const updated1 = await repo.findById(e1.entityId);
      expect(updated1.data!.value).toBe(99);
    });
  });

  describe('insert', () => {
    it('should insert multiple entities', async () => {
      const items = [
        { entityId: createId(), name: 'mass-1', value: 1 },
        { entityId: createId(), name: 'mass-2', value: 2 },
      ];
      const result = await repo.insert(items);
      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
      const all = await repo.findAll();
      expect(all.data!.length).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should find first matching entity', async () => {
      await repo.create({ entityId: createId(), name: 'a', value: 1 });
      await repo.create({ entityId: createId(), name: 'b', value: 2 });
      const filter: Filter<TestEntity> = { conditions: [{ field: 'name', operator: 'eq', value: 'a' }] };
      const result = await repo.findOne(filter);
      expect(result.success).toBe(true);
      expect(result.data!.name).toBe('a');
    });

    it('should return error when not found', async () => {
      const filter: Filter<TestEntity> = { conditions: [{ field: 'name', operator: 'eq', value: 'nonexistent' }] };
      const result = await repo.findOne(filter);
      expect(result.success).toBe(false);
    });
  });
});
