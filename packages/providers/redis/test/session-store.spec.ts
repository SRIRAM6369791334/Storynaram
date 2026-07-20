import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';
import { SessionStore } from '../src/session/session-store';

vi.mock('ioredis', () => ({
  default: RedisMock,
  Cluster: RedisMock.Cluster,
}));

describe('SessionStore', () => {
  let connection: RedisConnection;
  let store: SessionStore;

  beforeEach(async () => {
    connection = new RedisConnection({});
    await connection.initialize({ host: 'localhost', port: 6379, lazyConnect: true });
    store = new SessionStore(connection, 'test');
  });

  afterEach(async () => {
    await connection.close();
  });

  it('creates a session', async () => {
    const session = await store.create({ user: 'alice' });
    expect(session.sessionId).toBeTruthy();
    expect(session.data.user).toBe('alice');
    expect(session.createdAt).toBeGreaterThan(0);
    expect(session.expiresAt).toBeGreaterThan(session.createdAt);
  });

  it('get returns a session', async () => {
    const created = await store.create({ role: 'admin' });
    const fetched = await store.get(created.sessionId);
    expect(fetched).toBeDefined();
    expect(fetched?.data.role).toBe('admin');
  });

  it('get returns undefined for expired session', async () => {
    const session = await store.create({ temp: true }, 0);
    await new Promise(r => setTimeout(r, 10));
    const result = await store.get(session.sessionId);
    expect(result).toBeUndefined();
  });

  it('get returns undefined for nonexistent session', async () => {
    const result = await store.get('nonexistent-session-id');
    expect(result).toBeUndefined();
  });

  it('update merges data', async () => {
    const session = await store.create({ a: 1 });
    const updated = await store.update(session.sessionId, { b: 2 });
    expect(updated).toBeDefined();
    expect(updated?.data).toEqual({ a: 1, b: 2 });
  });

  it('update returns undefined for nonexistent session', async () => {
    const result = await store.update('bad-id', { x: 1 });
    expect(result).toBeUndefined();
  });

  it('delete removes a session', async () => {
    const session = await store.create({ temp: true });
    const deleted = await store.delete(session.sessionId);
    expect(deleted).toBe(true);
    const fetched = await store.get(session.sessionId);
    expect(fetched).toBeUndefined();
  });

  it('delete returns false for nonexistent', async () => {
    const result = await store.delete('no-such-session');
    expect(result).toBe(false);
  });

  it('exists checks session existence', async () => {
    const session = await store.create({ test: true });
    expect(await store.exists(session.sessionId)).toBe(true);
    expect(await store.exists('fake-id')).toBe(false);
  });

  it('touch extends TTL', async () => {
    const session = await store.create({ x: 1 }, 100);
    await new Promise(r => setTimeout(r, 10));
    const touched = await store.touch(session.sessionId, 5000);
    expect(touched).toBe(true);
    const ttl = await store.getTTL(session.sessionId);
    expect(ttl).toBeGreaterThan(100);
  });

  it('getActiveSessionCount returns number', async () => {
    await store.create({ u: '1' });
    await store.create({ u: '2' });
    const count = await store.getActiveSessionCount();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  it('clearExpired removes stale sessions', async () => {
    await store.create({ stale: true }, 0);
    await store.create({ fresh: true }, 50000);
    await new Promise(r => setTimeout(r, 10));
    const removed = await store.clearExpired();
    expect(removed).toBeGreaterThanOrEqual(1);
  });
});
