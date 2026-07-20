import { describe, it, expect, beforeEach } from 'vitest';
import type { EntityId } from '@storynaram/core';
import { MemoryRepository } from '../src/repository/memory-repository';
import type { Sort } from '../src/repository/types';

interface TestEntity {
  entityId: EntityId;
  name: string;
  value: number;
}

function createId(): EntityId {
  return crypto.randomUUID() as EntityId;
}

describe('MemoryRepository pagination', () => {
  let repo: MemoryRepository<TestEntity>;

  beforeEach(async () => {
    repo = new MemoryRepository<TestEntity>('test');
    for (let i = 0; i < 25; i++) {
      await repo.create({ entityId: createId(), name: `item-${String(i)}`, value: i });
    }
  });

  describe('paginate', () => {
    it('should return first page with default limit', async () => {
      const result = await repo.paginate({ page: 1, limit: 10 });
      expect(result.items.length).toBe(10);
      expect(result.total).toBe(25);
      expect(result.totalPages).toBe(3);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrevious).toBe(false);
    });

    it('should return second page', async () => {
      const result = await repo.paginate({ page: 2, limit: 10 });
      expect(result.items.length).toBe(10);
      expect(result.page).toBe(2);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrevious).toBe(true);
    });

    it('should return last page', async () => {
      const result = await repo.paginate({ page: 3, limit: 10 });
      expect(result.items.length).toBe(5);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrevious).toBe(true);
    });

    it('should sort ascending', async () => {
      const sort: Sort<TestEntity>[] = [{ field: 'value', direction: 'asc' }];
      const result = await repo.paginate({ page: 1, limit: 5 }, undefined, sort);
      expect(result.items[0]!.value).toBe(0);
      expect(result.items[4]!.value).toBe(4);
    });

    it('should sort descending', async () => {
      const sort: Sort<TestEntity>[] = [{ field: 'value', direction: 'desc' }];
      const result = await repo.paginate({ page: 1, limit: 5 }, undefined, sort);
      expect(result.items[0]!.value).toBe(24);
      expect(result.items[4]!.value).toBe(20);
    });
  });

  describe('cursor', () => {
    it('should return first page', async () => {
      const result = await repo.cursor({ limit: 10 });
      expect(result.items.length).toBe(10);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrevious).toBe(false);
      expect(result.nextCursor).toBeDefined();
    });

    it('should paginate forward', async () => {
      const page1 = await repo.cursor({ limit: 10 });
      const page2 = await repo.cursor({ limit: 10, cursor: page1.nextCursor });
      expect(page2.items.length).toBe(10);
      expect(page2.hasPrevious).toBe(true);
    });

    it('should handle last page', async () => {
      const page1 = await repo.cursor({ limit: 10 });
      const page2 = await repo.cursor({ limit: 10, cursor: page1.nextCursor });
      const page3 = await repo.cursor({ limit: 10, cursor: page2.nextCursor });
      expect(page3.items.length).toBe(5);
      expect(page3.hasNext).toBe(false);
    });
  });

  describe('stream', () => {
    it('should stream all entities', async () => {
      const items: TestEntity[] = [];
      for await (const item of repo.stream()) {
        items.push(item);
      }
      expect(items.length).toBe(25);
    });
  });
});
