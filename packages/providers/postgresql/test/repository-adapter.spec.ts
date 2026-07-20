import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RepositoryAdapter } from '../src/repository/repository-adapter';
import { PostgreSQLConnection } from '../src/connection/postgresql-connection';
import { ConnectionPool } from '../src/connection/connection-pool';
import { TransactionManager } from '../src/transaction/transaction-manager';
import { QueryCompiler } from '../src/query/query-compiler';
import { EntityMapper } from '../src/repository/entity-mapper';

vi.mock('pg', () => {
  const mockClient = {
    release: vi.fn(),
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0, command: '' }),
  };
  const mockPool = {
    connect: vi.fn().mockResolvedValue(mockClient),
    query: vi.fn().mockImplementation((sql: string, params?: unknown[]) => {
      if (sql.includes('SELECT')) {
        return Promise.resolve({
          rows: [],
          rowCount: 0,
          command: 'SELECT',
        });
      }
      if (sql.includes('INSERT')) {
        return Promise.resolve({
          rows: [],
          rowCount: 1,
          command: 'INSERT',
        });
      }
      if (sql.includes('DELETE')) {
        return Promise.resolve({ rows: [], rowCount: 0, command: 'DELETE' });
      }
      return Promise.resolve({ rows: [], rowCount: 1, command: '' });
    }),
    end: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    totalCount: 1,
    idleCount: 1,
    waitingCount: 0,
  };
  return {
    default: {
      Pool: vi.fn(() => mockPool),
    },
    Pool: vi.fn(() => mockPool),
  };
});

interface TestEntity {
  entityId: string;
  name: string;
  age: number;
}

describe('RepositoryAdapter', () => {
  let pool: ConnectionPool;
  let connection: PostgreSQLConnection;
  let txnManager: TransactionManager;
  let compiler: QueryCompiler;
  let mapper: EntityMapper;
  let adapter: RepositoryAdapter<TestEntity>;

  beforeEach(async () => {
    vi.clearAllMocks();
    pool = new ConnectionPool();
    await pool.initialize({
      host: 'localhost',
      port: 5432,
      database: 'test',
      username: 'test',
      password: 'test',
    });
    connection = new PostgreSQLConnection(pool);
    txnManager = new TransactionManager(pool);
    compiler = new QueryCompiler();
    mapper = new EntityMapper();
    adapter = new RepositoryAdapter<TestEntity>('test_entity', 'test_entities', connection, txnManager, compiler, mapper);
  });

  it('supports transactions', () => {
    expect(adapter.supportsTransactions()).toBe(true);
  });

  it('begins a transaction', async () => {
    const txn = await adapter.beginTransaction();
    expect(txn).toBeDefined();
    expect(txn.id).toBeDefined();
  });

  it('checks existence of an entity', async () => {
    const exists = await adapter.exists('nonexistent');
    expect(exists).toBe(false);
  });

  it('counts entities', async () => {
    const count = await adapter.count();
    expect(count).toBe(0);
  });

  it('finds by id returns undefined for missing', async () => {
    const result = await adapter.findById('missing');
    expect(result).toBeUndefined();
  });

  it('finds all returns empty array', async () => {
    const result = await adapter.findAll();
    expect(result).toEqual([]);
  });

  it('finds one returns undefined for missing', async () => {
    const result = await adapter.findOne({ conditions: [{ field: 'name', operator: 'eq', value: 'Alice' }] });
    expect(result).toBeUndefined();
  });

  it('finds many returns empty array', async () => {
    const result = await adapter.findMany();
    expect(result).toEqual([]);
  });

  it('paginates successfully', async () => {
    const result = await adapter.paginate({ page: 1, limit: 10 });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(0);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrevious).toBe(false);
  });

  it('creates an entity', async () => {
    const entity: TestEntity = { entityId: '1', name: 'Test', age: 25 };
    const result = await adapter.create(entity);
    expect(result).toEqual(entity);
  });

  it('inserts multiple entities', async () => {
    const entities: TestEntity[] = [
      { entityId: '1', name: 'A', age: 20 },
      { entityId: '2', name: 'B', age: 30 },
    ];
    const result = await adapter.insert(entities);
    expect(result).toEqual(entities);
  });

  it('deletes returns false for missing', async () => {
    const result = await adapter.delete('missing');
    expect(result).toBe(false);
  });

  it('streams entities', async () => {
    const items: TestEntity[] = [];
    for await (const item of adapter.stream()) {
      items.push(item);
    }
    expect(items).toEqual([]);
  });
});
