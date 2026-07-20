import { describe, bench, beforeAll, afterAll } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';
import { StreamManager } from '../src/stream/stream-manager';

const conn = new RedisConnection({});
let streamManager: StreamManager;

beforeAll(async () => {
  await conn.initialize({ host: 'localhost', port: 6379, lazyConnect: true });
  streamManager = new StreamManager(conn, 'bench');
});

afterAll(async () => {
  await conn.close();
});

describe('Stream benchmarks', () => {
  bench('append', async () => {
    await streamManager.append('bench:stream', { data: 'test' });
  }, { time: 3000 });

  bench('read', async () => {
    await streamManager.read('bench:stream', '0');
  }, { time: 3000 });
});
