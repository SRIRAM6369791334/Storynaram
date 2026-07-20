import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SQLiteConnection } from '../src/connection/sqlite-connection';
import { HealthIndicator } from '../src/observability/health-indicator';

describe('HealthIndicator', () => {
  let conn: SQLiteConnection;
  let health: HealthIndicator;

  beforeEach(async () => {
    conn = new SQLiteConnection();
    await conn.initialize({ database: ':memory:' });
    health = new HealthIndicator(conn);
  });

  afterEach(async () => {
    await conn.close();
  });

  it('reports healthy status', () => {
    const result = health.check();
    expect(result.status).toBe('healthy');
    expect(result.connection).toBe(true);
  });

  it('reports last check', () => {
    health.check();
    const last = health.getLastCheck();
    expect(last).not.toBeNull();
    expect(last!.lastChecked).toBeInstanceOf(Date);
  });
});
