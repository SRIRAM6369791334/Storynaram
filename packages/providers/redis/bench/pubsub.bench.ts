import { describe, bench, beforeAll, afterAll } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';
import { PubSubManager } from '../src/pubsub/pubsub-manager';

const conn = new RedisConnection({});
let pubsub: PubSubManager;

beforeAll(async () => {
  await conn.initialize({ host: 'localhost', port: 6379, lazyConnect: true });
  pubsub = new PubSubManager(conn);
  await pubsub.initialize();
  await pubsub.subscribe('bench:chan');
});

afterAll(async () => {
  await pubsub.shutdown();
  await conn.close();
});

describe('PubSub benchmarks', () => {
  bench('publish', async () => {
    await pubsub.publish('bench:chan', { data: 'test' });
  }, { time: 3000 });
});
