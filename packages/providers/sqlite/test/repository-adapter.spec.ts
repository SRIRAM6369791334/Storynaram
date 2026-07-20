import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SQLiteConnection } from '../src/connection/sqlite-connection';
import { TransactionManager } from '../src/transaction/transaction-manager';
import { QueryCompiler } from '../src/query/query-compiler';
import { EntityMapper } from '../src/repository/entity-mapper';
import { RepositoryAdapter } from '../src/repository/repository-adapter';

interface TestEntity {
  entityId: string;
  name: string;
  age: number;
}

describe('RepositoryAdapter (SQLite)', () => {
  let conn: SQLiteConnection;
  let txnManager: TransactionManager;
  let compiler: QueryCompiler;
  let mapper: EntityMapper;
  let adapter: RepositoryAdapter<TestEntity>;

  beforeEach(async () => {
    conn = new SQLiteConnection();
    await conn.initialize({ database: ':memory:' });
    conn.execute(`CREATE TABLE "test_entities" ("entity_id" TEXT PRIMARY KEY, "name" TEXT, "age" INTEGER, "deleted_at" TEXT, "created_at" TEXT, "updated_at" TEXT)`);
    txnManager = new TransactionManager(conn);
    compiler = new QueryCompiler();
    mapper = new EntityMapper();
    adapter = new RepositoryAdapter<TestEntity>('test_entity', 'test_entities', conn, txnManager, compiler, mapper);
  });

  afterEach(async () => {
    await conn.close();
  });

  it('supports transactions', () => {
    expect(adapter.supportsTransactions()).toBe(true);
  });

  it('begins a transaction', async () => {
    const txn = await adapter.beginTransaction();
    expect(txn).toBeDefined();
    expect(txn.id).toBeDefined();
  });

  it('creates and finds by id', async () => {
    const entity: TestEntity = { entityId: '1', name: 'Alice', age: 30 };
    await adapter.create(entity);
    const found = await adapter.findById('1');
    expect(found).toBeDefined();
    expect(found!.name).toBe('Alice');
    expect(found!.age).toBe(30);
  });

  it('returns undefined for missing findById', async () => {
    const found = await adapter.findById('nonexistent');
    expect(found).toBeUndefined();
  });

  it('checks existence', async () => {
    await adapter.create({ entityId: '1', name: 'A', age: 20 });
    expect(await adapter.exists('1')).toBe(true);
    expect(await adapter.exists('2')).toBe(false);
  });

  it('counts entities', async () => {
    expect(await adapter.count()).toBe(0);
    await adapter.create({ entityId: '1', name: 'A', age: 20 });
    await adapter.create({ entityId: '2', name: 'B', age: 25 });
    expect(await adapter.count()).toBe(2);
  });

  it('finds all', async () => {
    await adapter.insert([
      { entityId: '1', name: 'A', age: 20 },
      { entityId: '2', name: 'B', age: 25 },
    ]);
    const all = await adapter.findAll();
    expect(all).toHaveLength(2);
  });

  it('finds many with filter', async () => {
    await adapter.insert([
      { entityId: '1', name: 'A', age: 20 },
      { entityId: '2', name: 'B', age: 25 },
      { entityId: '3', name: 'C', age: 30 },
    ]);
    const result = await adapter.findMany({ conditions: [{ field: 'age', operator: 'gte', value: 25 }] });
    expect(result).toHaveLength(2);
  });

  it('finds one', async () => {
    await adapter.create({ entityId: '1', name: 'A', age: 20 });
    const found = await adapter.findOne({ conditions: [{ field: 'name', operator: 'eq', value: 'A' }] });
    expect(found).toBeDefined();
    expect(found!.name).toBe('A');
  });

  it('updates entity', async () => {
    await adapter.create({ entityId: '1', name: 'A', age: 20 });
    const updated = await adapter.update('1', { name: 'Updated', age: 21 });
    expect(updated.name).toBe('Updated');
    expect(updated.age).toBe(21);
  });

  it('deletes entity', async () => {
    await adapter.create({ entityId: '1', name: 'A', age: 20 });
    const deleted = await adapter.delete('1');
    expect(deleted).toBe(true);
    expect(await adapter.exists('1')).toBe(false);
  });

  it('returns false deleting nonexistent', async () => {
    const result = await adapter.delete('nonexistent');
    expect(result).toBe(false);
  });

  it('soft deletes and restores', async () => {
    await adapter.create({ entityId: '1', name: 'A', age: 20 });
    const softDeleted = await adapter.softDelete('1');
    expect(softDeleted).toBeDefined();
    expect(softDeleted.entityId).toBe('1');
    const restored = await adapter.restore('1');
    expect(restored).toBeDefined();
  });

  it('inserts batch', async () => {
    const entities = [
      { entityId: '1', name: 'A', age: 20 },
      { entityId: '2', name: 'B', age: 25 },
    ];
    const result = await adapter.insert(entities);
    expect(result).toHaveLength(2);
    expect(await adapter.count()).toBe(2);
  });

  it('paginates', async () => {
    for (let i = 0; i < 25; i++) {
      await adapter.create({ entityId: `${i}`, name: `User${i}`, age: 20 + i });
    }
    const page = await adapter.paginate({ page: 2, limit: 10 });
    expect(page.items).toHaveLength(10);
    expect(page.total).toBe(25);
    expect(page.page).toBe(2);
    expect(page.totalPages).toBe(3);
  });

  it('streams entities', async () => {
    await adapter.insert([
      { entityId: '1', name: 'A', age: 20 },
      { entityId: '2', name: 'B', age: 25 },
    ]);
    const items: TestEntity[] = [];
    for await (const item of adapter.stream()) {
      items.push(item);
    }
    expect(items).toHaveLength(2);
  });

  it('saves (inserts new)', async () => {
    const saved = await adapter.save({ entityId: '1', name: 'New', age: 10 });
    expect(saved.entityId).toBe('1');
    expect(await adapter.count()).toBe(1);
  });

  it('saves (updates existing)', async () => {
    await adapter.create({ entityId: '1', name: 'Old', age: 10 });
    await adapter.save({ entityId: '1', name: 'Updated', age: 99 });
    const found = await adapter.findById('1');
    expect(found!.name).toBe('Updated');
  });
});
