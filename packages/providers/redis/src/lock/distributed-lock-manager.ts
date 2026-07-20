import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { RedisConnection } from '../connection/redis-connection';
import type { LockOptions } from '../types';
import { LockNotAcquiredError, LockError } from '../errors';

@Injectable()
export class DistributedLockManager {
  private readonly logger = new Logger(DistributedLockManager.name);
  private readonly keyPrefix: string;
  private renewalTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly connection: RedisConnection,
    keyPrefix?: string,
  ) {
    this.keyPrefix = keyPrefix ?? 'lock';
  }

  async acquire(resource: string, options: LockOptions): Promise<{ token: string; released: boolean }> {
    const lockKey = this.buildKey(resource);
    const token = uuid();
    const ttlMs = options.ttl;

    try {
      const client = this.connection.getNativeClient();
      const result = await client.set(lockKey, token, 'PX', ttlMs, 'NX');

      if (result !== 'OK') {
        const retryCount = options.retryCount ?? 3;
        const retryDelay = options.retryDelay ?? 100;

        for (let i = 0; i < retryCount; i++) {
          await this.delay(retryDelay);
          const retryResult = await client.set(lockKey, token, 'PX', ttlMs, 'NX');
          if (retryResult === 'OK') {
            this.startRenewal(lockKey, token, ttlMs, options);
            return { token, released: false };
          }
        }

        throw new LockNotAcquiredError(resource);
      }

      this.startRenewal(lockKey, token, ttlMs, options);
      return { token, released: false };
    } catch (err) {
      if (err instanceof LockNotAcquiredError) throw err;
      throw new LockError(`Failed to acquire lock: ${(err as Error).message}`);
    }
  }

  async release(resource: string, token: string): Promise<boolean> {
    const lockKey = this.buildKey(resource);
    this.stopRenewal(lockKey);

    try {
      const client = this.connection.getNativeClient();
      const luaScript = `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
          return redis.call("DEL", KEYS[1])
        else
          return 0
        end
      `;
      const result = await client.eval(luaScript, 1, lockKey, token);
      return result === 1;
    } catch (err) {
      this.logger.error(`Failed to release lock: ${(err as Error).message}`);
      return false;
    }
  }

  async renew(resource: string, token: string, ttlMs: number): Promise<boolean> {
    const lockKey = this.buildKey(resource);
    try {
      const client = this.connection.getNativeClient();
      const luaScript = `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
          return redis.call("PEXPIRE", KEYS[1], ARGV[2])
        else
          return 0
        end
      `;
      const result = await client.eval(luaScript, 1, lockKey, token, ttlMs);
      return result === 1;
    } catch (err) {
      this.logger.error(`Failed to renew lock: ${(err as Error).message}`);
      return false;
    }
  }

  async isLocked(resource: string): Promise<boolean> {
    const lockKey = this.buildKey(resource);
    try {
      const client = this.connection.getNativeClient();
      const exists = await client.exists(lockKey);
      return exists > 0;
    } catch {
      return false;
    }
  }

  async getLockTTL(resource: string): Promise<number> {
    const lockKey = this.buildKey(resource);
    try {
      const client = this.connection.getNativeClient();
      return client.pttl(lockKey);
    } catch {
      return -2;
    }
  }

  async executeWithLock<T>(resource: string, options: LockOptions, fn: () => Promise<T>): Promise<T> {
    const { token } = await this.acquire(resource, options);
    try {
      return await fn();
    } finally {
      await this.release(resource, token);
    }
  }

  async releaseAll(): Promise<void> {
    for (const [key] of this.renewalTimers) {
      this.stopRenewal(key);
    }
  }

  private buildKey(resource: string): string {
    return `${this.keyPrefix}:${resource}`;
  }

  private startRenewal(lockKey: string, token: string, ttlMs: number, options: LockOptions): void {
    if (!options.autoRenewal) return;

    this.stopRenewal(lockKey);
    const interval = options.renewalInterval ?? Math.floor(ttlMs / 3);
    const renewalTtl = ttlMs;

    const timer = setInterval(async () => {
      try {
        const client = this.connection.getNativeClient();
        const luaScript = `
          if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("PEXPIRE", KEYS[1], ARGV[2])
          else
            return 0
          end
        `;
        await client.eval(luaScript, 1, lockKey, token, renewalTtl);
      } catch (err) {
        this.logger.warn(`Lock renewal failed for ${lockKey}: ${(err as Error).message}`);
      }
    }, interval);

    this.renewalTimers.set(lockKey, timer);
  }

  private stopRenewal(lockKey: string): void {
    const timer = this.renewalTimers.get(lockKey);
    if (timer) {
      clearInterval(timer);
      this.renewalTimers.delete(lockKey);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
