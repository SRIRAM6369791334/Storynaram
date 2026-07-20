import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectionPool } from '../src/connection/connection-pool';
import type { PostgreSQLConnectionOptions } from '../src/types';

vi.mock('pg', () => {
  const mockClient = {
    release: vi.fn(),
    query: vi.fn().mockResolvedValue({ rows: [{ result: 1 }], rowCount: 1, command: 'SELECT' }),
  };
  const mockPool = {
    connect: vi.fn().mockResolvedValue(mockClient),
    query: vi.fn().mockResolvedValue({ rows: [{ result: 1 }], rowCount: 1, command: 'SELECT' }),
    end: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    totalCount: 5,
    idleCount: 3,
    waitingCount: 0,
  };
  return {
    default: {
      Pool: vi.fn(() => mockPool),
    },
    Pool: vi.fn(() => mockPool),
  };
});

describe('ConnectionPool', () => {
  let pool: ConnectionPool;
  const options: PostgreSQLConnectionOptions = {
    host: 'localhost',
    port: 5432,
    database: 'test',
    username: 'test',
    password: 'test',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    pool = new ConnectionPool();
  });

  it('initializes successfully', async () => {
    await expect(pool.initialize(options)).resolves.not.toThrow();
  });

  it('throws PoolError when not initialized', () => {
    expect(() => pool.getPool()).toThrow('Pool not initialized');
  });

  it('returns pool after initialization', async () => {
    await pool.initialize(options);
    const p = pool.getPool();
    expect(p).toBeDefined();
  });

  it('acquires and releases client', async () => {
    await pool.initialize(options);
    const client = await pool.acquireClient();
    expect(client).toBeDefined();
    expect(client.release).toBeDefined();
    pool.releaseClient(client);
    expect(client.release).toHaveBeenCalled();
  });

  it('executes queries', async () => {
    await pool.initialize(options);
    const result = await pool.query('SELECT 1 as result');
    expect(result.rows).toEqual([{ result: 1 }]);
  });

  it('returns pool metrics', async () => {
    await pool.initialize(options);
    const metrics = pool.getMetrics();
    expect(metrics.totalConnections).toBe(5);
    expect(metrics.idleConnections).toBe(3);
    expect(metrics.maxConnections).toBe(10);
  });

  it('returns zeroed metrics when not initialized', () => {
    const metrics = pool.getMetrics();
    expect(metrics.totalConnections).toBe(0);
    expect(metrics.maxConnections).toBe(10);
  });

  it('shuts down cleanly', async () => {
    await pool.initialize(options);
    await pool.shutdown();
    expect(() => pool.getPool()).toThrow('Pool not initialized');
  });

  it('validates connection', async () => {
    await pool.initialize(options);
    await expect(pool.validate()).resolves.not.toThrow();
  });

  it('throws on query before initialization', async () => {
    await expect(pool.query('SELECT 1')).rejects.toThrow('Pool not initialized');
  });
});
