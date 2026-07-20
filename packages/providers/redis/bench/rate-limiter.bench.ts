import { describe, bench, beforeAll, afterAll } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';
import { RateLimiter } from '../src/rate-limiter/rate-limiter';

const conn = new RedisConnection({});
let limiter: RateLimiter;

beforeAll(async () => {
  await conn.initialize({ host: 'localhost', port: 6379, lazyConnect: true });
  limiter = new RateLimiter(conn, 'bench');
});

afterAll(async () => {
  await conn.close();
});

describe('Rate limiter benchmarks', () => {
  bench('fixed window check', async () => {
    await limiter.check('bench:rl', { windowMs: 60000, maxRequests: 1000, type: 'fixed' });
  }, { time: 3000 });

  bench('sliding window check', async () => {
    await limiter.check('bench:sliding', { windowMs: 60000, maxRequests: 1000, type: 'sliding' });
  }, { time: 3000 });

  bench('token bucket check', async () => {
    await limiter.check('bench:token', { windowMs: 60000, maxRequests: 1000, type: 'token-bucket', burstSize: 100, refillRate: 10 });
  }, { time: 3000 });
});
