import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';
import { PubSubManager } from '../src/pubsub/pubsub-manager';

vi.mock('ioredis', () => ({
  default: RedisMock,
  Cluster: RedisMock.Cluster,
}));

describe('PubSubManager', () => {
  let connection: RedisConnection;
  let pubsub: PubSubManager;

  beforeEach(async () => {
    connection = new RedisConnection({});
    await connection.initialize({ host: 'localhost', port: 6379, lazyConnect: true });
    pubsub = new PubSubManager(connection);
    await pubsub.initialize();
  });

  afterEach(async () => {
    const client = connection.getNativeClient();
    await client.quit();
    await connection.close();
  });

  it('publishes a message', async () => {
    const count = await pubsub.publish('test:channel', { hello: 'world' });
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it('getSubscribedChannels returns active channels', async () => {
    await pubsub.subscribe('chan-1');
    await pubsub.subscribe('chan-2');
    const channels = pubsub.getSubscribedChannels();
    expect(channels).toContain('chan-1');
    expect(channels).toContain('chan-2');
  });

  it('getSubscribedPatterns returns active patterns', async () => {
    await pubsub.psubscribe('test:*');
    await pubsub.psubscribe('other:*');
    const patterns = pubsub.getSubscribedPatterns();
    expect(patterns).toContain('test:*');
    expect(patterns).toContain('other:*');
  });

  it('unsubscribe removes a channel', async () => {
    await pubsub.subscribe('unsub-chan');
    await pubsub.unsubscribe('unsub-chan');
    const channels = pubsub.getSubscribedChannels();
    expect(channels).not.toContain('unsub-chan');
  });

  it('punsubscribe removes a pattern', async () => {
    await pubsub.psubscribe('temp:*');
    await pubsub.punsubscribe('temp:*');
    const patterns = pubsub.getSubscribedPatterns();
    expect(patterns).not.toContain('temp:*');
  });
});
