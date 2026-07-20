import { describe, it, expect, beforeEach } from 'vitest';
import { AICacheService } from '../src/ai';
import type { AIResponse } from '../src/ai';

describe('AICacheService', () => {
  let cache: AICacheService;
  const mockResponse: AIResponse = {
    id: 'r1', model: 'test', provider: 'mock', messages: [{ role: 'assistant', content: 'Hello' }],
    tokenUsage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 }, finishReason: 'stop', latencyMs: 10,
  };

  beforeEach(() => {
    cache = new AICacheService(60000);
  });

  it('should generate consistent cache keys', () => {
    const key1 = cache.generateKey({ model: 'test', messages: [{ role: 'user', content: 'Hi' }] });
    const key2 = cache.generateKey({ model: 'test', messages: [{ role: 'user', content: 'Hi' }] });
    expect(key1).toBe(key2);
  });

  it('should generate different keys for different inputs', () => {
    const key1 = cache.generateKey({ model: 'test', messages: [{ role: 'user', content: 'Hi' }] });
    const key2 = cache.generateKey({ model: 'test', messages: [{ role: 'user', content: 'Hello' }] });
    expect(key1).not.toBe(key2);
  });

  it('should store and retrieve cached responses', () => {
    const key = cache.generateKey({ model: 'test', messages: [{ role: 'user', content: 'Hi' }] });
    cache.set(key, mockResponse);
    const cached = cache.get(key);
    expect(cached?.id).toBe('r1');
  });

  it('should return undefined for cache miss', () => {
    const result = cache.get('nonexistent');
    expect(result).toBeUndefined();
  });

  it('should use getOrSet', async () => {
    const key = cache.generateKey({ model: 'test', messages: [{ role: 'user', content: 'Hi' }] });
    const result = await cache.getOrSet(key, async () => mockResponse);
    expect(result.id).toBe('r1');
  });

  it('should track hit/miss stats', () => {
    expect(cache.stats.hits).toBe(0);
    expect(cache.stats.misses).toBe(0);

    cache.get('miss');
    expect(cache.stats.misses).toBe(1);

    const key = cache.generateKey({ model: 'test', messages: [{ role: 'user', content: 'Hi' }] });
    cache.set(key, mockResponse);
    cache.get(key);
    expect(cache.stats.hits).toBe(1);
  });

  it('should invalidate by key', () => {
    const key = cache.generateKey({ model: 'test', messages: [{ role: 'user', content: 'Hi' }] });
    cache.set(key, mockResponse);
    cache.invalidate(key);
    expect(cache.get(key)).toBeUndefined();
  });

  it('should invalidate by provider', () => {
    const key = cache.generateKey({ model: 'test', provider: 'mock', messages: [{ role: 'user', content: 'Hi' }] });
    cache.set(key, mockResponse);
    cache.invalidateByProvider('mock');
    expect(cache.get(key)).toBeUndefined();
  });

  it('should clear all entries', () => {
    const key = cache.generateKey({ model: 'test', messages: [{ role: 'user', content: 'Hi' }] });
    cache.set(key, mockResponse);
    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.stats.hits).toBe(0);
  });

  it('should expire entries', async () => {
    const shortCache = new AICacheService(10);
    const key = shortCache.generateKey({ model: 'test', messages: [{ role: 'user', content: 'Hi' }] });
    shortCache.set(key, mockResponse);
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(shortCache.get(key)).toBeUndefined();
  });

  it('should prune expired entries', async () => {
    const shortCache = new AICacheService(10);
    shortCache.set('k1', mockResponse);
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(shortCache.prune()).toBe(1);
  });

  it('should report correct size', () => {
    const key = cache.generateKey({ model: 'test', messages: [{ role: 'user', content: 'Hi' }] });
    expect(cache.size).toBe(0);
    cache.set(key, mockResponse);
    expect(cache.size).toBe(1);
  });
});
