import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';
import { AICacheAdapter } from '../src/storage/ai-cache-adapter';

vi.mock('ioredis', () => ({
  default: RedisMock,
  Cluster: RedisMock.Cluster,
}));

describe('AICacheAdapter', () => {
  let connection: RedisConnection;
  let adapter: AICacheAdapter;

  beforeEach(async () => {
    connection = new RedisConnection({});
    await connection.initialize({ host: 'localhost', port: 6379, lazyConnect: true });
    adapter = new AICacheAdapter(connection, 'test');
  });

  afterEach(async () => {
    await connection.close();
  });

  it('saves and retrieves a conversation', async () => {
    const conversation = {
      id: 'conv-1',
      messages: [
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi there!' },
      ],
      metadata: {},
    };
    await adapter.saveConversation(conversation);
    const retrieved = await adapter.getConversation('conv-1');
    expect(retrieved).toBeDefined();
    expect(retrieved?.messages.length).toBe(2);
    expect(retrieved?.messages[0]?.content).toBe('Hello');
  });

  it('saves and retrieves a session', async () => {
    const session = {
      id: 'session-1',
      conversation: { id: 'conv-s1', messages: [], metadata: {} },
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: { source: 'web' },
    };
    await adapter.saveSession(session);
    const retrieved = await adapter.getSession('session-1');
    expect(retrieved).toBeDefined();
    expect(retrieved?.metadata.source).toBe('web');
    expect(retrieved?.conversation.id).toBe('conv-s1');
  });

  it('recordTokenUsage and getSessionTokenUsage', async () => {
    await adapter.recordTokenUsage('session-t1', 100, 50);
    const usage = await adapter.getSessionTokenUsage('session-t1');
    expect(usage.totalTokens).toBeGreaterThanOrEqual(150);
  });

  it('recordCost and getTotalCosts', async () => {
    await adapter.recordCost('openai', 'gpt-4', 1000, 200, 0.05);
    await adapter.recordCost('anthropic', 'claude-3', 500, 100, 0.02);
    const costs = await adapter.getTotalCosts();
    expect(costs.totalCostUsd).toBeGreaterThanOrEqual(0.07);
    expect(costs.byProvider.openai).toBeGreaterThanOrEqual(0.05);
    expect(costs.byProvider.anthropic).toBeGreaterThanOrEqual(0.02);
  });

  it('deleteSession removes session and conversation', async () => {
    const session = {
      id: 'session-del',
      conversation: { id: 'conv-del', messages: [{ role: 'user' as const, content: 'x' }], metadata: {} },
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
    };
    await adapter.saveSession(session);
    await adapter.deleteSession('session-del');
    const retrieved = await adapter.getSession('session-del');
    expect(retrieved).toBeUndefined();
  });

  it('getSession returns undefined for missing', async () => {
    const result = await adapter.getSession('no-session');
    expect(result).toBeUndefined();
  });

  it('getConversation returns undefined for missing', async () => {
    const result = await adapter.getConversation('no-conv');
    expect(result).toBeUndefined();
  });
});
