import { Injectable, Logger } from '@nestjs/common';
import { RedisConnection } from '../connection/redis-connection';
import type { CacheOptions, CacheEntry, CacheStats } from '../types';

@Injectable()
export class RedisCacheProvider {
  private readonly logger = new Logger(RedisCacheProvider.name);
  private hits = 0;
  private misses = 0;
  private readonly keyPrefix: string;

  constructor(
    private readonly connection: RedisConnection,
    keyPrefix?: string,
  ) {
    this.keyPrefix = keyPrefix ?? 'cache';
  }

  async get<T>(key: string, options?: CacheOptions): Promise<T | undefined> {
    const fullKey = this.buildKey(key, options?.namespace);
    try {
      const client = this.connection.getNativeClient();
      const raw = await client.get(fullKey);

      if (raw === null) {
        this.misses++;
        return undefined;
      }

      const entry = this.deserialize<CacheEntry<T>>(raw);
      if (!entry) {
        this.misses++;
        return undefined;
      }

      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        await client.del(fullKey);
        this.misses++;
        return undefined;
      }

      if (options?.sliding && options.ttl) {
        await client.pexpire(fullKey, options.ttl);
      }

      this.hits++;
      return entry.value;
    } catch (err) {
      this.logger.error(`Cache get failed: ${(err as Error).message}`);
      this.misses++;
      return undefined;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const fullKey = this.buildKey(key, options?.namespace);
    try {
      const client = this.connection.getNativeClient();
      const entry: CacheEntry<T> = {
        value,
        createdAt: Date.now(),
      };

      if (options?.absoluteExpiration) {
        entry.expiresAt = options.absoluteExpiration;
      } else if (options?.ttl) {
        entry.expiresAt = Date.now() + options.ttl;
      }

      const serialized = this.serialize(entry);

      if (entry.expiresAt) {
        const ttl = entry.expiresAt - Date.now();
        if (ttl > 0) {
          await client.setex(fullKey, Math.ceil(ttl / 1000), serialized);
        }
      } else {
        await client.set(fullKey, serialized);
      }
    } catch (err) {
      this.logger.error(`Cache set failed: ${(err as Error).message}`);
    }
  }

  async delete(key: string, namespace?: string): Promise<boolean> {
    const fullKey = this.buildKey(key, namespace);
    try {
      const client = this.connection.getNativeClient();
      const result = await client.del(fullKey);
      return result > 0;
    } catch (err) {
      this.logger.error(`Cache delete failed: ${(err as Error).message}`);
      return false;
    }
  }

  async exists(key: string, namespace?: string): Promise<boolean> {
    const fullKey = this.buildKey(key, namespace);
    try {
      const client = this.connection.getNativeClient();
      const result = await client.exists(fullKey);
      return result > 0;
    } catch {
      return false;
    }
  }

  async ttl(key: string, namespace?: string): Promise<number> {
    const fullKey = this.buildKey(key, namespace);
    try {
      const client = this.connection.getNativeClient();
      return client.pttl(fullKey);
    } catch {
      return -2;
    }
  }

  async getMany<T>(keys: string[], namespace?: string): Promise<(T | undefined)[]> {
    const fullKeys = keys.map(k => this.buildKey(k, namespace));
    try {
      const client = this.connection.getNativeClient();
      const rawResults = await client.mget(...fullKeys);
      return rawResults.map((raw: string | null) => {
        if (raw === null) {
          this.misses++;
          return undefined;
        }
        const entry = this.deserialize<CacheEntry<T>>(raw);
        if (!entry || (entry.expiresAt && Date.now() > entry.expiresAt)) {
          this.misses++;
          return undefined;
        }
        this.hits++;
        return entry.value;
      });
    } catch {
      return keys.map(() => undefined);
    }
  }

  async setMany<T>(entries: { key: string; value: T; options?: CacheOptions }[]): Promise<void> {
    const client = this.connection.getNativeClient();
    const pipeline = client.pipeline();

    for (const { key, value, options } of entries) {
      const fullKey = this.buildKey(key, options?.namespace);
      const entry: CacheEntry<T> = {
        value,
        createdAt: Date.now(),
      };
      if (options?.absoluteExpiration) {
        entry.expiresAt = options.absoluteExpiration;
      } else if (options?.ttl) {
        entry.expiresAt = Date.now() + options.ttl;
      }
      const serialized = this.serialize(entry);
      if (entry.expiresAt) {
        const ttl = entry.expiresAt - Date.now();
        if (ttl > 0) {
          pipeline.setex(fullKey, Math.ceil(ttl / 1000), serialized);
        }
      } else {
        pipeline.set(fullKey, serialized);
      }
    }

    await pipeline.exec();
  }

  async deleteMany(keys: string[], namespace?: string): Promise<number> {
    const fullKeys = keys.map(k => this.buildKey(k, namespace));
    try {
      const client = this.connection.getNativeClient();
      return client.del(...fullKeys);
    } catch {
      return 0;
    }
  }

  async clearNamespace(namespace: string): Promise<void> {
    const pattern = `${this.keyPrefix}:${namespace}:*`;
    try {
      const client = this.connection.getNativeClient();
      let cursor = '0';
      do {
        const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          await client.del(...keys);
        }
      } while (cursor !== '0');
    } catch (err) {
      this.logger.error(`Clear namespace failed: ${(err as Error).message}`);
    }
  }

  async getStats(): Promise<CacheStats> {
    const client = this.connection.getNativeClient();
    let keys = 0;
    try {
      keys = await client.dbsize();
    } catch { /* ignore */ }
    return {
      hits: this.hits,
      misses: this.misses,
      keys,
    };
  }

  async increment(key: string, amount = 1, namespace?: string): Promise<number> {
    const fullKey = this.buildKey(key, namespace);
    const client = this.connection.getNativeClient();
    return client.incrby(fullKey, amount);
  }

  private buildKey(key: string, namespace?: string): string {
    if (namespace) {
      return `${this.keyPrefix}:${namespace}:${key}`;
    }
    return `${this.keyPrefix}:${key}`;
  }

  private serialize<T>(value: T): string {
    return JSON.stringify(value);
  }

  private deserialize<T>(raw: string): T | undefined {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  }
}
