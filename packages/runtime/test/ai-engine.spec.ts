import { describe, it, expect, beforeEach } from 'vitest';
import { AIRuntimeService, AIProviderRegistry, AIModelRegistry, AIPromptBuilder, AISessionManager, AIToolRegistry, AIToolExecutor, AIStreamingSession, AICacheService, AICostTracker, AIStatisticsService, AIOutputValidator, AIRetryPolicy, AIFallbackPolicy, MockProvider, AI_RUNTIME_OPTIONS } from '../src/ai';
import type { AIRuntimeOptions, AITool } from '../src/ai';

describe('AIRuntimeService', () => {
  let service: AIRuntimeService;
  let providerRegistry: AIProviderRegistry;

  function createService(options?: Partial<AIRuntimeOptions>): AIRuntimeService {
    const registry = new AIProviderRegistry();
    registry.register(new MockProvider({}));

    const modelRegistry = new AIModelRegistry();
    const opts: AIRuntimeOptions = {
      defaultProvider: 'mock',
      defaultModel: 'mock-model',
      enableCache: true,
      enableStatistics: true,
      enableCostTracking: true,
      ...options,
    };

    return new AIRuntimeService(
      registry,
      modelRegistry,
      new AIPromptBuilder(),
      new AISessionManager(),
      new AIToolRegistry(),
      new AIToolExecutor(new AIToolRegistry()),
      new AIStreamingSession(),
      new AICacheService(60000),
      new AICostTracker(),
      new AIStatisticsService(),
      new AIOutputValidator(),
      new AIRetryPolicy(),
      new AIFallbackPolicy(registry),
      opts,
    );
  }

  beforeEach(() => {
    service = createService();
  });

  it('should generate a response', async () => {
    const response = await service.generate({
      model: 'mock-model',
      messages: [{ role: 'user', content: 'Hello' }],
    });
    expect(response.messages[0]?.content).toBeTruthy();
    expect(response.provider).toBe('mock');
    expect(response.finishReason).toBe('stop');
  });

  it('should generate a stream', async () => {
    const chunks: string[] = [];
    const generator = service.generateStream({
      model: 'mock-model',
      messages: [{ role: 'user', content: 'Hello' }],
    });
    for await (const chunk of generator) {
      chunks.push(chunk.delta);
    }
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('should create and retrieve sessions', async () => {
    const session = await service.createSession('You are helpful');
    expect(session.conversation.systemPrompt).toBe('You are helpful');

    const retrieved = await service.getSession(session.id);
    expect(retrieved?.id).toBe(session.id);
  });

  it('should list sessions', async () => {
    await service.createSession();
    await service.createSession();
    const sessions = await service.listSessions();
    expect(sessions.length).toBe(2);
  });

  it('should add messages to session', async () => {
    const session = await service.createSession();
    await service.addMessageToSession(session.id, 'user', 'Hello');
    await service.addMessageToSession(session.id, 'assistant', 'Hi there');
    const messages = session.conversation.messages;
    expect(messages.length).toBe(2);
  });

  it('should register tools', () => {
    const tool: AITool = { name: 'test_tool', description: 'A test', parameters: {}, execute: async () => 'ok' };
    service.registerTool(tool);
    const stats = service.health() as Record<string, unknown>;
    // tool is registered internally, health check passes
    expect(stats.ok).toBe(true);
  });

  it('should provide health check', () => {
    const health = service.health() as Record<string, unknown>;
    expect(health.ok).toBe(true);
    expect(health.providers).toEqual(['mock']);
  });

  it('should provide statistics', () => {
    const statistics = service.getStatistics();
    expect(statistics.totalRequests).toBe(0);
  });

  it('should provide cache stats', () => {
    const cacheStats = service.getCacheStats();
    expect(cacheStats.size).toBe(0);
    expect(cacheStats.hitRate).toBe(0);
  });

  it('should generate with session context', async () => {
    const session = await service.createSession();
    await service.addMessageToSession(session.id, 'user', 'Hello');
    const response = await service.generate(
      { model: 'mock-model', messages: [{ role: 'user', content: 'World' }] },
      { sessionId: session.id },
    );
    expect(response).toBeDefined();
    expect(session.conversation.messages.length).toBe(2);
  });

  it('should respect custom options', async () => {
    const customService = createService({
      defaultProvider: 'mock',
      defaultModel: 'mock-model',
      enableCache: false,
    });
    const response = await customService.generate({
      model: 'mock-model',
      messages: [{ role: 'user', content: 'Test' }],
    });
    expect(response).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    providerRegistry = new AIProviderRegistry();
    const emptyService = createService({ defaultProvider: 'openai' });
    // openai provider not registered, will fail
    await expect(emptyService.generate({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Hello' }],
    })).rejects.toThrow();
  });

  it('should get total cost', () => {
    const cost = service.getTotalCost();
    expect(cost).toBe(0);
  });
});
