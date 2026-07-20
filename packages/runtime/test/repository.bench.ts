import { describe, it, expect } from 'vitest';
import type { EntityId } from '@storynaram/core';
import { MemoryRepository } from '../src/repository/memory-repository';

interface LightEntity {
  entityId: EntityId;
  name: string;
  value: number;
}

function createId(): EntityId {
  return crypto.randomUUID() as EntityId;
}

function measure(label: string, fn: () => Promise<void>): Promise<number> {
  return (async () => {
    const start = performance.now();
    await fn();
    return performance.now() - start;
  })();
}

describe('Repository benchmarks', () => {
  const SMALL_COUNT = 1000;
  const LARGE_COUNT = 100000;

  it.skipIf(typeof Bun !== 'undefined')('benchmark: insert 1,000 entities', async () => {
    const repo = new MemoryRepository<LightEntity>('bench');

    const elapsed = await measure(`insert ${String(SMALL_COUNT)}`, async () => {
      for (let i = 0; i < SMALL_COUNT; i++) {
        await repo.create({ entityId: createId(), name: `item-${String(i)}`, value: i });
      }
    });

    expect(repo.size).toBe(SMALL_COUNT);
    console.log(`Insert ${String(SMALL_COUNT)} entities: ${elapsed.toFixed(2)}ms (${(SMALL_COUNT / elapsed * 1000).toFixed(0)} ops/sec)`);
  });

  it('benchmark: insert 100,000 lightweight entities', async () => {
    const repo = new MemoryRepository<LightEntity>('bench-large');

    const elapsed = await measure(`insert ${String(LARGE_COUNT)}`, async () => {
      for (let i = 0; i < LARGE_COUNT; i++) {
        const id = createId();
        await repo.create({ entityId: id, name: 'x', value: i });
      }
    });

    expect(repo.size).toBe(LARGE_COUNT);
    console.log(`Insert ${String(LARGE_COUNT)} entities: ${elapsed.toFixed(2)}ms (${(LARGE_COUNT / elapsed * 1000).toFixed(0)} ops/sec)`);
  });

  it('benchmark: find by ID', async () => {
    const repo = new MemoryRepository<LightEntity>('bench-find');
    const ids: EntityId[] = [];
    for (let i = 0; i < SMALL_COUNT; i++) {
      const id = createId();
      ids.push(id);
      await repo.create({ entityId: id, name: `item-${String(i)}`, value: i });
    }

    const elapsed = await measure(`findById x${String(SMALL_COUNT)}`, async () => {
      for (const id of ids) {
        await repo.findById(id);
      }
    });

    console.log(`Find by ID ${String(SMALL_COUNT)} times: ${elapsed.toFixed(2)}ms (${(SMALL_COUNT / elapsed * 1000).toFixed(0)} ops/sec)`);
  });

  it('benchmark: pagination', async () => {
    const repo = new MemoryRepository<LightEntity>('bench-page');
    for (let i = 0; i < 10000; i++) {
      await repo.create({ entityId: createId(), name: `item-${String(i)}`, value: i });
    }

    const elapsed = await measure('paginate 100 pages', async () => {
      for (let page = 1; page <= 100; page++) {
        await repo.paginate({ page, limit: 100 });
      }
    });

    console.log(`Paginate 100 pages: ${elapsed.toFixed(2)}ms (${(100 / elapsed * 1000).toFixed(0)} pages/sec)`);
  });

  it('benchmark: bulk update', async () => {
    const repo = new MemoryRepository<LightEntity>('bench-update');
    const ids: EntityId[] = [];
    for (let i = 0; i < SMALL_COUNT; i++) {
      const id = createId();
      ids.push(id);
      await repo.create({ entityId: id, name: `item-${String(i)}`, value: i });
    }

    const elapsed = await measure(`bulkUpdate ${String(SMALL_COUNT)}`, async () => {
      const result = await repo.bulkUpdate(ids, { value: 999 });
      expect(result.processedCount).toBe(SMALL_COUNT);
    });

    console.log(`Bulk update ${String(SMALL_COUNT)} entities: ${elapsed.toFixed(2)}ms (${(SMALL_COUNT / elapsed * 1000).toFixed(0)} ops/sec)`);
  });

  it('benchmark: bulk delete', async () => {
    const repo = new MemoryRepository<LightEntity>('bench-delete');
    const ids: EntityId[] = [];
    for (let i = 0; i < SMALL_COUNT; i++) {
      const id = createId();
      ids.push(id);
      await repo.create({ entityId: id, name: `item-${String(i)}`, value: i });
    }

    const elapsed = await measure(`bulkDelete ${String(SMALL_COUNT)}`, async () => {
      const result = await repo.bulkDelete(ids);
      expect(result.processedCount).toBe(SMALL_COUNT);
    });

    console.log(`Bulk delete ${String(SMALL_COUNT)} entities: ${elapsed.toFixed(2)}ms (${(SMALL_COUNT / elapsed * 1000).toFixed(0)} ops/sec)`);
  });
});
