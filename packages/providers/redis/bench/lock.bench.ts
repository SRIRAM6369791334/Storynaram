import { describe, bench, beforeAll, afterAll } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';
import { DistributedLockManager } from '../src/lock/distributed-lock-manager';

const conn = new RedisConnection({});
let lockManager: DistributedLockManager;

beforeAll(async () => {
  await conn.initialize({ host: 'localhost', port: 6379, lazyConnect: true });
  lockManager = new DistributedLockManager(conn, 'bench');
});

afterAll(async () => {
  await conn.close();
});

describe('Lock benchmarks', () => {
  bench('lock acquisition', async () => {
    const lock = await lockManager.acquire('bench:lock', 1000);
    await lockManager.release(lock);
  }, { time: 3000 });
});
