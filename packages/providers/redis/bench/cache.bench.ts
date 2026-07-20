import { describe, bench, beforeAll, afterAll } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';
import { RedisCacheProvider } from '../src/cache/redis-cache-provider';

const conn = new RedisConnection({});
let cache: RedisCacheProvider;

beforeAll(async () => {
  await conn.initialize({ host: 'localhost', port: 6379, lazyConnect: true });
  cache = new RedisCacheProvider(conn, 'bench');
});

afterAll(async () => {
  await conn.close();
});

describe('Cache benchmarks', () => {
  bench('set 100K cache writes', async () => {
    for (let i = 0; i < 100_000; i++) {
      await cache.set(`bench:write:${i}`, `value-${i}`);
    }
  }, { time: 3000 });

  bench('get 100K cache reads', async () => {
    for (let i = 0; i < 100_000; i++) {
      await cache.get(`bench:read:${i}`);
    }
  }, { time: 3000 });
});
