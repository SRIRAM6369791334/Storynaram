import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';
import { StreamManager } from '../src/stream/stream-manager';

vi.mock('ioredis', () => ({
  default: RedisMock,
  Cluster: RedisMock.Cluster,
}));

describe('StreamManager', () => {
  let connection: RedisConnection;
  let streamManager: StreamManager;

  beforeEach(async () => {
    connection = new RedisConnection({});
    await connection.initialize({ host: 'localhost', port: 6379, lazyConnect: true });
    streamManager = new StreamManager(connection);
  });

  afterEach(async () => {
    await connection.close();
  });

  it('add returns an ID', async () => {
    const id = await streamManager.add('mystream', { key: 'value' });
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
  });

  it('reads messages from stream by ID', async () => {
    await streamManager.add('read-stream', { msg: 'hello' });
    const messages = await streamManager.read(['read-stream'], { count: 10 });
    expect(messages.length).toBeGreaterThanOrEqual(1);
    expect(messages[0]?.fields).toBeDefined();
  });

  it('getLength returns stream length', async () => {
    await streamManager.add('len-stream', { a: '1' });
    await streamManager.add('len-stream', { b: '2' });
    const len = await streamManager.getLength('len-stream');
    expect(len).toBeGreaterThanOrEqual(2);
  });

  it('deleteMessages removes messages from stream', async () => {
    const id = await streamManager.add('del-stream', { x: 'y' });
    const removed = await streamManager.deleteMessages('del-stream', [id]);
    expect(typeof removed).toBe('number');
  });

  it('trim limits stream length', async () => {
    for (let i = 0; i < 5; i++) {
      await streamManager.add('trim-stream', { i: String(i) });
    }
    const trimmed = await streamManager.trim('trim-stream', 3);
    expect(typeof trimmed).toBe('number');
  });
});
