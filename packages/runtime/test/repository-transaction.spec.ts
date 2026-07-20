import { describe, it, expect, beforeEach } from 'vitest';
import type { EntityId } from '@storynaram/core';
import { MemoryRepository } from '../src/repository/memory-repository';
import { DefaultTransaction } from '../src/repository/repository-transaction';
import { RepositoryTransactionError } from '../src/repository/errors';

interface TestEntity {
  entityId: EntityId;
  name: string;
  value: number;
}

function createId(): EntityId {
  return crypto.randomUUID() as EntityId;
}

describe('Repository transactions', () => {
  let repo: MemoryRepository<TestEntity>;

  beforeEach(() => {
    repo = new MemoryRepository<TestEntity>('test');
  });

  describe('DefaultTransaction', () => {
    it('should transition through lifecycle', async () => {
      let committed = false;
      const tx = new DefaultTransaction(
        async () => { committed = true; },
        async () => { /* noop */ },
      );
      expect(tx.status).toBe('pending');
      await tx.begin();
      expect(tx.status).toBe('active');
      expect(tx.isActive()).toBe(true);
      await tx.commit();
      expect(tx.status).toBe('committed');
      expect(committed).toBe(true);
    });

    it('should rollback', async () => {
      let rolledBack = false;
      const tx = new DefaultTransaction(
        async () => { /* noop */ },
        async () => { rolledBack = true; },
      );
      await tx.begin();
      await tx.rollback();
      expect(tx.status).toBe('rolled_back');
      expect(rolledBack).toBe(true);
    });

    it('should throw when committing non-active transaction', async () => {
      const tx = new DefaultTransaction(
        async () => { /* noop */ },
        async () => { /* noop */ },
      );
      await expect(tx.commit()).rejects.toThrow(RepositoryTransactionError);
    });
  });

  describe('MemoryRepository transactions', () => {
    it('should support transactions', () => {
      expect(repo.supportsTransactions()).toBe(true);
    });

    it('should rollback changes on rollback', async () => {
      const id = createId();
      const entity = (await repo.create({ entityId: id, name: 'pre-tx', value: 1 })).data!;

      const tx = await repo.beginTransaction();
      await tx.begin();
      await repo.update(id, { name: 'in-tx' });
      await tx.rollback();

      const result = await repo.findById(id);
      expect(result.data!.name).toBe('pre-tx');
    });

    it('should persist changes on commit', async () => {
      const id = createId();
      await repo.create({ entityId: id, name: 'pre-tx', value: 1 });

      const tx = await repo.beginTransaction();
      await tx.begin();
      await repo.update(id, { value: 999 });
      await tx.commit();

      const result = await repo.findById(id);
      expect(result.data!.value).toBe(999);
    });
  });
});
