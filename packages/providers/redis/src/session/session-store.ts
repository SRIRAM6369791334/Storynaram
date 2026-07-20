import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { RedisConnection } from '../connection/redis-connection';
import type { SessionData } from '../types';
import { SessionError } from '../errors';

@Injectable()
export class SessionStore {
  private readonly logger = new Logger(SessionStore.name);
  private readonly keyPrefix: string;
  private readonly defaultTTLMs: number;

  constructor(
    private readonly connection: RedisConnection,
    keyPrefix?: string,
    defaultTTLMs?: number,
  ) {
    this.keyPrefix = keyPrefix ?? 'session';
    this.defaultTTLMs = defaultTTLMs ?? 3600000;
  }

  async create(data: Record<string, unknown>, ttlMs?: number): Promise<SessionData> {
    const sessionId = this.generateSessionId();
    const now = Date.now();
    const expiresAt = now + (ttlMs ?? this.defaultTTLMs);

    const session: SessionData = {
      sessionId,
      data,
      expiresAt,
      createdAt: now,
      lastAccessedAt: now,
    };

    await this.save(session);
    return session;
  }

  async get(sessionId: string): Promise<SessionData | undefined> {
    const key = this.buildKey(sessionId);
    try {
      const client = this.connection.getNativeClient();
      const raw = await client.get(key);

      if (!raw) return undefined;

      const session = JSON.parse(raw) as SessionData;

      if (Date.now() > session.expiresAt) {
        await client.del(key);
        return undefined;
      }

      session.lastAccessedAt = Date.now();
      const ttl = session.expiresAt - Date.now();
      if (ttl > 0) {
        await client.pexpire(key, ttl);
      }

      return session;
    } catch (err) {
      throw new SessionError(`Failed to get session: ${(err as Error).message}`);
    }
  }

  async update(sessionId: string, data: Record<string, unknown>): Promise<SessionData | undefined> {
    const session = await this.get(sessionId);
    if (!session) return undefined;

    session.data = { ...session.data, ...data };
    session.lastAccessedAt = Date.now();

    await this.save(session);
    return session;
  }

  async delete(sessionId: string): Promise<boolean> {
    const key = this.buildKey(sessionId);
    try {
      const client = this.connection.getNativeClient();
      const result = await client.del(key);
      return result > 0;
    } catch {
      return false;
    }
  }

  async exists(sessionId: string): Promise<boolean> {
    const key = this.buildKey(sessionId);
    try {
      const client = this.connection.getNativeClient();
      const result = await client.exists(key);
      return result > 0;
    } catch {
      return false;
    }
  }

  async touch(sessionId: string, ttlMs?: number): Promise<boolean> {
    const key = this.buildKey(sessionId);
    try {
      const client = this.connection.getNativeClient();
      const ttl = ttlMs ?? this.defaultTTLMs;
      const result = await client.pexpire(key, ttl);
      return result === 1;
    } catch {
      return false;
    }
  }

  async getTTL(sessionId: string): Promise<number> {
    const key = this.buildKey(sessionId);
    try {
      const client = this.connection.getNativeClient();
      return client.pttl(key);
    } catch {
      return -2;
    }
  }

  async getActiveSessionCount(): Promise<number> {
    const pattern = `${this.keyPrefix}:*`;
    try {
      const client = this.connection.getNativeClient();
      let count = 0;
      let cursor = '0';
      do {
        const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 1000);
        cursor = nextCursor;
        count += keys.length;
      } while (cursor !== '0');
      return count;
    } catch {
      return 0;
    }
  }

  async clearExpired(): Promise<number> {
    const pattern = `${this.keyPrefix}:*`;
    let removed = 0;
    try {
      const client = this.connection.getNativeClient();
      let cursor = '0';
      do {
        const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        for (const key of keys) {
          const raw = await client.get(key);
          if (raw) {
            const session = JSON.parse(raw) as SessionData;
            if (Date.now() > session.expiresAt) {
              await client.del(key);
              removed++;
            }
          }
        }
      } while (cursor !== '0');
      return removed;
    } catch {
      return removed;
    }
  }

  private async save(session: SessionData): Promise<void> {
    const key = this.buildKey(session.sessionId);
    try {
      const client = this.connection.getNativeClient();
      const serialized = JSON.stringify(session);
      const ttl = session.expiresAt - Date.now();
      if (ttl > 0) {
        await client.setex(key, Math.ceil(ttl / 1000), serialized);
      } else {
        await client.set(key, serialized);
      }
    } catch (err) {
      throw new SessionError(`Failed to save session: ${(err as Error).message}`);
    }
  }

  private buildKey(sessionId: string): string {
    return `${this.keyPrefix}:${sessionId}`;
  }

  private generateSessionId(): string {
    return uuid();
  }
}
