import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUnitOfWork, EntityState } from '../src/unit-of-work';
import { Entity } from '../src/entity';
import { Identity } from '../src/identity';

class TestEntity extends Entity<Identity<string>> {
  constructor(id: string, public data: string) {
    super(new Identity(id));
  }

  update(value: string): void {
    this.data = value;
    this.markUpdated();
  }
}

describe('InMemoryUnitOfWork', () => {
  let uow: InMemoryUnitOfWork;

  beforeEach(() => {
    uow = new InMemoryUnitOfWork();
  });

  it('registers new entities', () => {
    const entity = new TestEntity('1', 'new');
    uow.registerNew(entity);
    expect(uow.getState(entity)).toBe(EntityState.NEW);
    expect(uow.getTrackedEntities()).toHaveLength(1);
  });

  it('registers dirty entities', () => {
    const entity = new TestEntity('1', 'original');
    uow.registerDirty(entity);
    expect(uow.getState(entity)).toBe(EntityState.DIRTY);
  });

  it('registers deleted entities', () => {
    const entity = new TestEntity('1', 'delete-me');
    uow.registerDeleted(entity);
    expect(uow.getState(entity)).toBe(EntityState.DELETED);
  });

  it('throws on duplicate registration', () => {
    const entity = new TestEntity('1', 'dup');
    uow.registerNew(entity);
    expect(() => uow.registerNew(entity)).toThrow('already tracked');
  });

  it('keeps new state when registering dirty', () => {
    const entity = new TestEntity('1', 'new-item');
    uow.registerNew(entity);
    uow.registerDirty(entity);
    expect(uow.getState(entity)).toBe(EntityState.NEW);
  });

  it('commit clears tracked entities', async () => {
    const entity = new TestEntity('1', 'temp');
    uow.registerNew(entity);
    await uow.commit();
    expect(uow.getTrackedEntities()).toHaveLength(0);
  });

  it('rollback clears tracked entities', async () => {
    const entity = new TestEntity('1', 'temp');
    uow.registerNew(entity);
    await uow.rollback();
    expect(uow.getTrackedEntities()).toHaveLength(0);
  });
});
