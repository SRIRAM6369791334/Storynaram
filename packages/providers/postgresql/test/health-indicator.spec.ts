import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthIndicator } from '../src/observability/health-indicator';
import { ConnectionPool } from '../src/connection/connection-pool';
import { PostgreSQLConnection } from '../src/connection/postgresql-connection';

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
    idleCount: 4,
    waitingCount: 1,
  };
  return {
    default: {
      Pool: vi.fn(() => mockPool),
    },
    Pool: vi.fn(() => mockPool),
  };
});

describe('HealthIndicator', () => {
  let pool: ConnectionPool;
  let connection: PostgreSQLConnection;
  let health: HealthIndicator;

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
    health = new HealthIndicator(pool, connection);
  });

  it('returns healthy status', async () => {
    const result = await health.check();
    expect(result.status).toBe('healthy');
    expect(result.connection).toBe(true);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(result.lastChecked).toBeInstanceOf(Date);
  });

  it('includes pool metrics', async () => {
    const result = await health.check();
    expect(result.pool.totalConnections).toBe(5);
    expect(result.pool.maxConnections).toBe(10);
  });

  it('returns null for last check before first check', async () => {
    const last = await health.getLastCheck();
    expect(last).toBeNull();
  });

  it('returns last check after checking', async () => {
    await health.check();
    const last = await health.getLastCheck();
    expect(last).not.toBeNull();
    expect(last!.status).toBe('healthy');
  });
});
