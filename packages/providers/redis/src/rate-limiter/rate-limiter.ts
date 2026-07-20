import { Injectable, Logger } from '@nestjs/common';
import { RedisConnection } from '../connection/redis-connection';
import type { RateLimiterOptions, RateLimitResult } from '../types';

@Injectable()
export class RateLimiter {
  private readonly logger = new Logger(RateLimiter.name);
  private readonly keyPrefix: string;

  constructor(
    private readonly connection: RedisConnection,
    keyPrefix?: string,
  ) {
    this.keyPrefix = keyPrefix ?? 'ratelimit';
  }

  async check(key: string, options: RateLimiterOptions): Promise<RateLimitResult> {
    switch (options.type) {
      case 'fixed':
        return this.checkFixedWindow(key, options);
      case 'sliding':
        return this.checkSlidingWindow(key, options);
      case 'token-bucket':
        return this.checkTokenBucket(key, options);
      case 'leaky-bucket':
        return this.checkLeakyBucket(key, options);
      default:
        return this.checkFixedWindow(key, options);
    }
  }

  async reset(key: string): Promise<void> {
    const fullKey = this.buildKey(key);
    try {
      const client = this.connection.getNativeClient();
      await client.del(fullKey);
    } catch (err) {
      this.logger.error(`Failed to reset rate limit: ${(err as Error).message}`);
    }
  }

  private async checkFixedWindow(key: string, options: RateLimiterOptions): Promise<RateLimitResult> {
    const windowKey = this.buildWindowKey(key, options.windowMs);
    const now = Date.now();
    const resetAt = now + options.windowMs;

    try {
      const client = this.connection.getNativeClient();
      const current = await client.incr(windowKey);

      if (current === 1) {
        await client.pexpire(windowKey, options.windowMs);
      }

      const allowed = current <= options.maxRequests;
      const remaining = Math.max(0, options.maxRequests - current);

      return { allowed, remaining, resetAt, totalLimit: options.maxRequests };
    } catch (err) {
      this.logger.error(`Fixed window check failed: ${(err as Error).message}`);
      return { allowed: true, remaining: 1, resetAt, totalLimit: options.maxRequests };
    }
  }

  private async checkSlidingWindow(key: string, options: RateLimiterOptions): Promise<RateLimitResult> {
    const slidingKey = this.buildKey(key);
    const now = Date.now();
    const windowStart = now - options.windowMs;
    const resetAt = now + options.windowMs;

    try {
      const client = this.connection.getNativeClient();
      const multi = client.multi();
      multi.zremrangebyscore(slidingKey, 0, windowStart);
      multi.zadd(slidingKey, now, `${now}-${Math.random()}`);
      multi.zcard(slidingKey);
      multi.pexpire(slidingKey, options.windowMs);
      const results = await multi.exec();

      const count = Number((results?.[2]?.[1] as number) ?? 0);
      const allowed = count <= options.maxRequests;
      const remaining = Math.max(0, options.maxRequests - count);

      return { allowed, remaining, resetAt, totalLimit: options.maxRequests };
    } catch (err) {
      this.logger.error(`Sliding window check failed: ${(err as Error).message}`);
      return { allowed: true, remaining: 1, resetAt, totalLimit: options.maxRequests };
    }
  }

  private async checkTokenBucket(key: string, options: RateLimiterOptions): Promise<RateLimitResult> {
    const bucketKey = this.buildKey(key);
    const now = Date.now();
    const refillRate = options.refillRate ?? 1;
    const burstSize = options.burstSize ?? options.maxRequests;
    const resetAt = now + options.windowMs;

    try {
      const client = this.connection.getNativeClient();
      const luaScript = `
        local key = KEYS[1]
        local now = tonumber(ARGV[1])
        local refillRate = tonumber(ARGV[2])
        local burstSize = tonumber(ARGV[3])
        local windowMs = tonumber(ARGV[4])

        local bucket = redis.call("HGETALL", key)
        local tokens = burstSize
        local lastRefill = now

        if #bucket > 0 then
          tokens = tonumber(bucket[2] or burstSize)
          lastRefill = tonumber(bucket[4] or now)
          local elapsed = now - lastRefill
          tokens = math.min(burstSize, tokens + (elapsed * refillRate / 1000))
        end

        local allowed = 0
        if tokens >= 1 then
          tokens = tokens - 1
          allowed = 1
        end

        redis.call("HSET", key, "tokens", tokens, "lastRefill", now)
        redis.call("PEXPIRE", key, windowMs)

        return { allowed, tokens, burstSize }
      `;

      const result = await client.eval(luaScript, 1, bucketKey, now, refillRate, burstSize, options.windowMs);
      const [allowed, remaining] = result as [number, number];

      return {
        allowed: allowed === 1,
        remaining: Math.floor(remaining),
        resetAt,
        totalLimit: burstSize,
      };
    } catch (err) {
      this.logger.error(`Token bucket check failed: ${(err as Error).message}`);
      return { allowed: true, remaining: 1, resetAt, totalLimit: options.maxRequests };
    }
  }

  private async checkLeakyBucket(key: string, options: RateLimiterOptions): Promise<RateLimitResult> {
    const bucketKey = this.buildKey(key);
    const now = Date.now();
    const leakRate = options.leakRate ?? 1;
    const capacity = options.capacity ?? options.maxRequests;
    const resetAt = now + options.windowMs;

    try {
      const client = this.connection.getNativeClient();
      const luaScript = `
        local key = KEYS[1]
        local now = tonumber(ARGV[1])
        local leakRate = tonumber(ARGV[2])
        local capacity = tonumber(ARGV[3])
        local windowMs = tonumber(ARGV[4])

        local bucket = redis.call("HGETALL", key)
        local water = 0
        local lastLeak = now

        if #bucket > 0 then
          water = tonumber(bucket[2] or 0)
          lastLeak = tonumber(bucket[4] or now)
          local elapsed = now - lastLeak
          water = math.max(0, water - (elapsed * leakRate / 1000))
        end

        local allowed = 0
        if water < capacity then
          water = water + 1
          allowed = 1
        end

        redis.call("HSET", key, "water", water, "lastLeak", now)
        redis.call("PEXPIRE", key, windowMs)

        return { allowed, water, capacity }
      `;

      const result = await client.eval(luaScript, 1, bucketKey, now, leakRate, capacity, options.windowMs);
      const [allowed, water] = result as [number, number];

      return {
        allowed: allowed === 1,
        remaining: Math.max(0, Math.floor(capacity - water)),
        resetAt,
        totalLimit: capacity,
      };
    } catch (err) {
      this.logger.error(`Leaky bucket check failed: ${(err as Error).message}`);
      return { allowed: true, remaining: 1, resetAt, totalLimit: options.maxRequests };
    }
  }

  private buildKey(key: string): string {
    return `${this.keyPrefix}:${key}`;
  }

  private buildWindowKey(key: string, windowMs: number): string {
    const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
    return `${this.keyPrefix}:${key}:${windowStart}`;
  }
}
