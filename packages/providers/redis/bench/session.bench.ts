import { describe, bench, beforeAll, afterAll } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';
import { SessionStore } from '../src/session/session-store';

const conn = new RedisConnection({});
let store: SessionStore;

beforeAll(async () => {
  await conn.initialize({ host: 'localhost', port: 6379, lazyConnect: true });
  store = new SessionStore(conn, 'bench');
});

afterAll(async () => {
  await conn.close();
});

describe('Session benchmarks', () => {
  bench('create session', async () => {
    await store.create({ user: 'bench-user' });
  }, { time: 3000 });

  bench('get session', async () => {
    await store.get('bench-session-id');
  }, { time: 3000 });
});
