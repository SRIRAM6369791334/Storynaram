import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MigrationRunner } from '../src/migration/migration-runner';
import { SchemaManager } from '../src/migration/schema-manager';
import { PostgreSQLConnection } from '../src/connection/postgresql-connection';
import { ConnectionPool } from '../src/connection/connection-pool';

const migrationState: { inserted: string[] } = { inserted: [] };

vi.mock('pg', () => {
  const mockClient = {
    release: vi.fn(),
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0, command: '' }),
  };
  const mockPool = {
    connect: vi.fn().mockResolvedValue(mockClient),
    query: vi.fn().mockImplementation((sql: string, params?: unknown[]) => {
      if (sql.includes('SELECT EXISTS')) {
        return Promise.resolve({ rows: [{ exists: false }], rowCount: 1, command: 'SELECT' });
      }
      if (sql.includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [], rowCount: 0, command: 'CREATE TABLE' });
      }
      if (sql.includes('SELECT') && sql.includes('_migrations')) {
        const rows = migrationState.inserted.map(v => ({
          version: v,
          name: `migration_${v}`,
          appliedAt: new Date(),
          durationMs: 10,
          checksum: 'abc123',
        }));
        return Promise.resolve({ rows, rowCount: rows.length, command: 'SELECT' });
      }
      if (sql.includes('INSERT INTO') && sql.includes('_migrations')) {
        migrationState.inserted.push(params![0] as string);
        return Promise.resolve({ rows: [], rowCount: 1, command: 'INSERT' });
      }
      return Promise.resolve({ rows: [], rowCount: 0, command: '' });
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

describe('MigrationRunner', () => {
  let pool: ConnectionPool;
  let connection: PostgreSQLConnection;
  let schemaManager: SchemaManager;
  let runner: MigrationRunner;

  beforeEach(async () => {
    vi.clearAllMocks();
    migrationState.inserted = [];
    pool = new ConnectionPool();
    await pool.initialize({
      host: 'localhost',
      port: 5432,
      database: 'test',
      username: 'test',
      password: 'test',
    });
    connection = new PostgreSQLConnection(pool);
    schemaManager = new SchemaManager(connection);
    runner = new MigrationRunner(connection, schemaManager);
  });

  it('ensures migrations table exists', async () => {
    await expect(runner.ensureMigrationsTable()).resolves.not.toThrow();
  });

  it('returns empty applied migrations on fresh db', async () => {
    const applied = await runner.getAppliedMigrations();
    expect(applied).toEqual([]);
  });

  it('runs migrations in order', async () => {
    const migrations = [
      { version: '001', name: 'initial', up: ['CREATE TABLE test (id TEXT PRIMARY KEY)'], down: ['DROP TABLE test'] },
      { version: '002', name: 'add_column', up: ['ALTER TABLE test ADD COLUMN name TEXT'], down: ['ALTER TABLE test DROP COLUMN name'] },
    ];
    const records = await runner.runMigrations(migrations, 'up');
    expect(records).toHaveLength(2);
    expect(records[0]!.version).toBe('001');
    expect(records[1]!.version).toBe('002');
  });

  it('skips already applied migrations', async () => {
    const migrations = [
      { version: '001', name: 'initial', up: ['CREATE TABLE test (id TEXT PRIMARY KEY)'] },
    ];
    await runner.runMigrations(migrations, 'up');
    const records = await runner.runMigrations(migrations, 'up');
    expect(records).toHaveLength(0);
  });

  it('respects target version', async () => {
    const migrations = [
      { version: '001', name: 'm1', up: ['CREATE TABLE t1 (id TEXT)'], down: ['DROP TABLE t1'] },
      { version: '002', name: 'm2', up: ['CREATE TABLE t2 (id TEXT)'], down: ['DROP TABLE t2'] },
      { version: '003', name: 'm3', up: ['CREATE TABLE t3 (id TEXT)'], down: ['DROP TABLE t3'] },
    ];
    const records = await runner.runMigrations(migrations, 'up', '002');
    expect(records).toHaveLength(2);
    expect(records[0]!.version).toBe('001');
    expect(records[1]!.version).toBe('002');
  });

  it('runs seed statements', async () => {
    await expect(runner.seed(['INSERT INTO test VALUES (1)'])).resolves.not.toThrow();
  });
});
