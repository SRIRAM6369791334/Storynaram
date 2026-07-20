import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';
import { RateLimiter } from '../src/rate-limiter/rate-limiter';

vi.mock('ioredis', () => ({
  default: RedisMock,
  Cluster: RedisMock.Cluster,
}));

describe('RateLimiter', () => {
  let connection: RedisConnection;
  let limiter: RateLimiter;

  beforeEach(async () => {
    connection = new RedisConnection({});
    await connection.initialize({ host: 'localhost', port: 6379, lazyConnect: true });
    limiter = new RateLimiter(connection, 'test');
  });

  afterEach(async () => {
    await connection.close();
  });

  describe('fixed window', () => {
    it('allows requests within limit', async () => {
      const result = await limiter.check('fw:1', { windowMs: 10000, maxRequests: 5, type: 'fixed' });
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('blocks when limit exceeded', async () => {
      const opts = { windowMs: 10000, maxRequests: 2, type: 'fixed' as const };
      await limiter.check('fw:2', opts);
      await limiter.check('fw:2', opts);
      const result = await limiter.check('fw:2', opts);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe('sliding window', () => {
    it('allows requests within limit', async () => {
      const result = await limiter.check('sw:1', { windowMs: 10000, maxRequests: 5, type: 'sliding' });
      expect(result.allowed).toBe(true);
    });

    it('blocks when limit exceeded', async () => {
      const opts = { windowMs: 5000, maxRequests: 1, type: 'sliding' as const };
      await limiter.check('sw:2', opts);
      const result = await limiter.check('sw:2', opts);
      expect(result.allowed).toBe(false);
    });
  });

  describe('token bucket', () => {
    it('allows requests within burst', async () => {
      const result = await limiter.check('tb:1', { windowMs: 60000, maxRequests: 10, type: 'token-bucket', burstSize: 5, refillRate: 1 });
      expect(result.allowed).toBe(true);
    });

    it('blocks when tokens exhausted', async () => {
      const opts = { windowMs: 60000, maxRequests: 10, type: 'token-bucket' as const, burstSize: 1, refillRate: 0 };
      await limiter.check('tb:2', opts);
      const result = await limiter.check('tb:2', opts);
      expect(result.allowed).toBe(false);
    });
  });

  describe('leaky bucket', () => {
    it('allows requests within capacity', async () => {
      const result = await limiter.check('lb:1', { windowMs: 60000, maxRequests: 10, type: 'leaky-bucket', capacity: 5, leakRate: 1 });
      expect(result.allowed).toBe(true);
    });

    it('blocks when capacity exceeded', async () => {
      const opts = { windowMs: 60000, maxRequests: 10, type: 'leaky-bucket' as const, capacity: 1, leakRate: 0 };
      await limiter.check('lb:2', opts);
      await limiter.check('lb:2', opts);
      const result = await limiter.check('lb:2', opts);
      expect(result.allowed).toBe(false);
    });
  });

  it('different keys are independent', async () => {
    const opts = { windowMs: 10000, maxRequests: 1, type: 'fixed' as const };
    await limiter.check('user-a', opts);
    const resultB = await limiter.check('user-b', opts);
    expect(resultB.allowed).toBe(true);
    expect(resultB.remaining).toBe(0);
  });
});
