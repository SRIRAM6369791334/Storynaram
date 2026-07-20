import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';
import { DistributedLockManager } from '../src/lock/distributed-lock-manager';
import { LockNotAcquiredError } from '../src/errors';

vi.mock('ioredis', () => ({
  default: RedisMock,
  Cluster: RedisMock.Cluster,
}));

describe('DistributedLockManager', () => {
  let connection: RedisConnection;
  let lockManager: DistributedLockManager;

  beforeEach(async () => {
    connection = new RedisConnection({});
    await connection.initialize({ host: 'localhost', port: 6379, lazyConnect: true });
    lockManager = new DistributedLockManager(connection, 'test');
  });

  afterEach(async () => {
    await connection.close();
  });

  it('acquires a lock', async () => {
    const lock = await lockManager.acquire('resource:1', { ttl: 1000 });
    expect(lock).toBeTruthy();
    expect(lock.token).toBeTruthy();
  });

  it('releases a lock', async () => {
    const lock = await lockManager.acquire('resource:2', { ttl: 1000 });
    const released = await lockManager.release('resource:2', lock.token);
    expect(released).toBe(true);
  });

  it('fails to acquire an already held lock', async () => {
    await lockManager.acquire('resource:3', { ttl: 1000 });
    await expect(lockManager.acquire('resource:3', { ttl: 1000 })).rejects.toThrow(LockNotAcquiredError);
  });

  it('lock expires after TTL', async () => {
    await lockManager.acquire('exp-resource', { ttl: 50 });
    await new Promise(r => setTimeout(r, 60));
    const lock2 = await lockManager.acquire('exp-resource', { ttl: 100 });
    expect(lock2).toBeTruthy();
  });

  it('safe unlock does not release another owner\'s lock', async () => {
    const lock1 = await lockManager.acquire('safe', { ttl: 5000 });
    const fakeRelease = await lockManager.release('safe', 'wrong-token');
    expect(fakeRelease).toBe(false);
    const lock2 = await lockManager.acquire('safe', { ttl: 100, retryCount: 0 }).catch(() => null);
    expect(lock2).toBeNull();
  });

  it('acquire with retry succeeds after lock released', async () => {
    const lock1 = await lockManager.acquire('retry-resource', { ttl: 100 });
    setTimeout(() => lockManager.release('retry-resource', lock1.token), 30);
    const lock2 = await lockManager.acquire('retry-resource', { ttl: 1000, retryDelay: 20, retryCount: 10 });
    expect(lock2).toBeTruthy();
    expect(lock2.token).toBeTruthy();
  });

  it('executeWithLock runs callback and releases lock', async () => {
    const result = await lockManager.executeWithLock('exec-resource', { ttl: 1000 }, async () => 'done');
    expect(result).toBe('done');
  });

  it('executeWithLock releases on error', async () => {
    await expect(
      lockManager.executeWithLock('err-resource', { ttl: 1000 }, async () => { throw new Error('test error'); }),
    ).rejects.toThrow('test error');
    const lock = await lockManager.acquire('err-resource', { ttl: 100 });
    expect(lock).toBeTruthy();
  });
});
