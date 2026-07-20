import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';
import { RedisCacheProvider } from '../src/cache/redis-cache-provider';

vi.mock('ioredis', () => ({
  default: RedisMock,
  Cluster: RedisMock.Cluster,
}));

describe('RedisCacheProvider', () => {
  let connection: RedisConnection;
  let cache: RedisCacheProvider;

  beforeEach(async () => {
    connection = new RedisConnection({});
    await connection.initialize({ host: 'localhost', port: 6379, lazyConnect: true });
    cache = new RedisCacheProvider(connection, 'test');
  });

  afterEach(async () => {
    await connection.close();
  });

  it('set and get a value', async () => {
    await cache.set('key1', 'value1');
    const result = await cache.get('key1');
    expect(result).toBe('value1');
  });

  it('get returns undefined for missing key', async () => {
    const result = await cache.get('nonexistent');
    expect(result).toBeUndefined();
  });

  it('delete removes a key', async () => {
    await cache.set('delkey', 'val');
    const deleted = await cache.delete('delkey');
    expect(deleted).toBe(true);
    const result = await cache.get('delkey');
    expect(result).toBeUndefined();
  });

  it('exists returns true for existing key', async () => {
    await cache.set('exist', 'val');
    const exists = await cache.exists('exist');
    expect(exists).toBe(true);
  });

  it('exists returns false for missing key', async () => {
    const exists = await cache.exists('nope');
    expect(exists).toBe(false);
  });

  it('ttl returns -2 for missing key', async () => {
    const ttl = await cache.ttl('missing');
    expect(ttl).toBe(-2);
  });

  it('ttl returns positive for key with TTL', async () => {
    await cache.set('ttlkey', 'val', { ttl: 60_000 });
    const ttl = await cache.ttl('ttlkey');
    expect(ttl).toBeGreaterThan(0);
  });

  it('getMany returns array of values', async () => {
    await cache.set('a', '1');
    await cache.set('b', '2');
    const results = await cache.getMany(['a', 'b', 'c']);
    expect(results).toHaveLength(3);
    expect(results[0]).toBe('1');
    expect(results[1]).toBe('2');
    expect(results[2]).toBeUndefined();
  });

  it('setMany sets multiple values', async () => {
    await cache.setMany([
      { key: 'x', value: '10' },
      { key: 'y', value: '20' },
    ]);
    expect(await cache.get('x')).toBe('10');
    expect(await cache.get('y')).toBe('20');
  });

  it('deleteMany removes multiple keys', async () => {
    await cache.setMany([
      { key: 'd1', value: '1' },
      { key: 'd2', value: '2' },
    ]);
    const count = await cache.deleteMany(['d1', 'd2']);
    expect(count).toBe(2);
    expect(await cache.get('d1')).toBeUndefined();
    expect(await cache.get('d2')).toBeUndefined();
  });

  it('clearNamespace removes all keys with namespace prefix', async () => {
    await cache.set('a', '1', { namespace: 'ns1' });
    await cache.set('b', '2', { namespace: 'ns1' });
    await cache.set('c', '3', { namespace: 'other' });
    await cache.clearNamespace('ns1');
    expect(await cache.get('a', { namespace: 'ns1' })).toBeUndefined();
    expect(await cache.get('b', { namespace: 'ns1' })).toBeUndefined();
    expect(await cache.get('c', { namespace: 'other' })).toBe('3');
  });

  it('increment increases value', async () => {
    const v1 = await cache.increment('counter');
    expect(v1).toBe(1);
    const v2 = await cache.increment('counter', 5);
    expect(v2).toBe(6);
  });

  it('serializes complex objects', async () => {
    const obj = { name: 'test', count: 42, nested: { a: 1 } };
    await cache.set('obj', obj);
    const result = await cache.get<typeof obj>('obj');
    expect(result).toEqual(obj);
  });

  it('getStats returns hit/miss counters', async () => {
    await cache.set('k', 'v');
    await cache.get('k');
    await cache.get('missing');
    const stats = await cache.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
  });

  it('concurrent access does not corrupt data', async () => {
    const promises = Array.from({ length: 50 }, (_, i) => cache.set(`concurrent:${i}`, `val-${i}`));
    await Promise.all(promises);
    const result = await cache.get('concurrent:0');
    expect(result).toBe('val-0');
    const allKeys = await Promise.all(Array.from({ length: 50 }, (_, i) => cache.get(`concurrent:${i}`)));
    expect(allKeys.every((v, i) => v === `val-${i}`)).toBe(true);
  });
});
