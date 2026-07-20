import { describe, bench, beforeAll, afterAll } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';
import { QueueManager } from '../src/queue/queue-manager';

const conn = new RedisConnection({});
let queue: QueueManager;

beforeAll(async () => {
  await conn.initialize({ host: 'localhost', port: 6379, lazyConnect: true });
  queue = new QueueManager(conn, 'bench');
});

afterAll(async () => {
  await conn.close();
});

describe('Queue benchmarks', () => {
  bench('enqueue', async () => {
    await queue.enqueue('bench:q', { payload: 'test' });
  }, { time: 3000 });

  bench('dequeue', async () => {
    await queue.dequeueNonBlocking('bench:q');
  }, { time: 3000 });
});
