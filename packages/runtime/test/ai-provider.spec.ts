import { describe, it, expect, beforeEach } from 'vitest';
import { MockProvider, AIProviderRegistry, AIModelRegistry } from '../src/ai';
import { AIProviderError, AIModelError } from '../src/ai';

describe('MockProvider', () => {
  let provider: MockProvider;

  beforeEach(() => {
    provider = new MockProvider({});
  });

  it('should have correct name and capabilities', () => {
    expect(provider.name).toBe('mock');
    expect(provider.displayName).toBe('Mock Provider');
    expect(provider.capabilities.streaming).toBe(true);
    expect(provider.capabilities.toolUse).toBe(true);
  });

  it('should generate a response', async () => {
    const response = await provider.generate({
      model: 'mock-model',
      messages: [{ role: 'user', content: 'Hello' }],
    });
    expect(response.model).toBe('mock-model');
    expect(response.provider).toBe('mock');
    expect(response.messages[0]?.role).toBe('assistant');
    expect(response.messages[0]?.content).toBeTruthy();
    expect(response.tokenUsage.inputTokens).toBeGreaterThan(0);
    expect(response.tokenUsage.outputTokens).toBeGreaterThan(0);
    expect(response.finishReason).toBe('stop');
  });

  it('should generate a stream', async () => {
    const chunks: string[] = [];
    const generator = provider.generateStream({
      model: 'mock-model',
      messages: [{ role: 'user', content: 'Hello world' }],
    });
    for await (const chunk of generator) {
      chunks.push(chunk.delta);
    }
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.join('')).toContain('Hello');
  });

  it('should count tokens', async () => {
    const count = await provider.countTokens([{ role: 'user', content: 'Hello world' }]);
    expect(count).toBeGreaterThan(0);
  });

  it('should list models', () => {
    const models = provider.listModels();
    expect(models.length).toBe(2);
    expect(models[0]?.id).toBe('mock-model');
  });

  it('should return model by id', () => {
    const model = provider.getModel('mock-model');
    expect(model?.id).toBe('mock-model');
    expect(model?.contextWindow).toBe(128000);
  });

  it('should return undefined for unknown model', () => {
    const model = provider.getModel('unknown');
    expect(model).toBeUndefined();
  });

  it('should report healthy', async () => {
    const health = await provider.health();
    expect(health.ok).toBe(true);
  });

  it('should track call history', async () => {
    expect(provider.getCallHistory().length).toBe(0);
    await provider.generate({
      model: 'mock-model',
      messages: [{ role: 'user', content: 'Hello' }],
    });
    expect(provider.getCallHistory().length).toBe(1);
  });

  it('should clear call history', async () => {
    await provider.generate({
      model: 'mock-model',
      messages: [{ role: 'user', content: 'Hello' }],
    });
    provider.clearCallHistory();
    expect(provider.getCallHistory().length).toBe(0);
  });

  it('should return tool calls when tools are provided', async () => {
    const response = await provider.generate({
      model: 'mock-model',
      messages: [{ role: 'user', content: 'Use a tool' }],
      tools: [{ type: 'function', function: { name: 'test_tool', description: 'A test tool', parameters: { type: 'object', properties: {} } } }],
    });
    expect(response.messages[0]?.toolCalls).toBeDefined();
    expect(response.messages[0]?.toolCalls?.length).toBe(1);
    expect(response.messages[0]?.toolCalls?.[0]?.function.name).toBe('test_tool');
  });

  it('should simulate failure rate', async () => {
    const failingProvider = new MockProvider({ failureRate: 1 });
    await expect(failingProvider.generate({
      model: 'mock-model',
      messages: [{ role: 'user', content: 'Hello' }],
    })).rejects.toThrow('Mock provider simulated failure');
  });
});

describe('AIProviderRegistry', () => {
  let registry: AIProviderRegistry;

  beforeEach(() => {
    registry = new AIProviderRegistry();
  });

  it('should register and resolve a provider', () => {
    const provider = new MockProvider({});
    registry.register(provider);
    expect(registry.resolve('mock')).toBe(provider);
  });

  it('should throw when resolving unregistered provider', () => {
    expect(() => registry.resolve('openai')).toThrow(AIProviderError);
  });

  it('should list registered providers', () => {
    registry.register(new MockProvider({}));
    const providers = registry.list();
    expect(providers.length).toBe(1);
    expect(providers[0]?.name).toBe('mock');
  });

  it('should list provider names', () => {
    registry.register(new MockProvider({}));
    expect(registry.listNames()).toEqual(['mock']);
  });

  it('should check if provider exists', () => {
    expect(registry.has('mock')).toBe(false);
    registry.register(new MockProvider({}));
    expect(registry.has('mock')).toBe(true);
  });

  it('should unregister a provider', () => {
    registry.register(new MockProvider({}));
    registry.unregister('mock');
    expect(registry.has('mock')).toBe(false);
  });

  it('should get provider without throwing', () => {
    expect(registry.get('mock')).toBeUndefined();
    registry.register(new MockProvider({}));
    expect(registry.get('mock')).toBeDefined();
  });

  it('should create provider from config', () => {
    const provider = registry.createProvider({ name: 'mock', displayName: 'Mock' });
    expect(provider.name).toBe('mock');
  });

  it('should throw for unknown provider type', () => {
    expect(() => registry.createProvider({ name: 'unknown' as any, displayName: 'Unknown' })).toThrow();
  });
});

describe('AIModelRegistry', () => {
  let modelRegistry: AIModelRegistry;

  beforeEach(() => {
    modelRegistry = new AIModelRegistry();
  });

  it('should register and resolve a model', () => {
    modelRegistry.register({
      id: 'test-model',
      provider: 'mock',
      displayName: 'Test Model',
      contextWindow: 1000,
      maxOutputTokens: 100,
      capabilities: { vision: false, toolUse: false, streaming: true, functionCalling: false, jsonMode: true, embedding: false },
    });
    const model = modelRegistry.resolve('test-model');
    expect(model.id).toBe('test-model');
    expect(model.contextWindow).toBe(1000);
  });

  it('should throw when resolving unregistered model', () => {
    expect(() => modelRegistry.resolve('unknown')).toThrow(AIModelError);
  });

  it('should list all models', () => {
    modelRegistry.register({
      id: 'model-a', provider: 'mock', displayName: 'A', contextWindow: 1000, maxOutputTokens: 100,
      capabilities: { vision: false, toolUse: false, streaming: true, functionCalling: false, jsonMode: true, embedding: false },
    });
    modelRegistry.register({
      id: 'model-b', provider: 'mock', displayName: 'B', contextWindow: 2000, maxOutputTokens: 200,
      capabilities: { vision: false, toolUse: false, streaming: true, functionCalling: false, jsonMode: true, embedding: false },
    });
    expect(modelRegistry.list().length).toBe(2);
  });

  it('should filter models by provider', () => {
    modelRegistry.register({
      id: 'm1', provider: 'mock', displayName: 'M1', contextWindow: 1000, maxOutputTokens: 100,
      capabilities: { vision: false, toolUse: false, streaming: true, functionCalling: false, jsonMode: true, embedding: false },
    });
    modelRegistry.register({
      id: 'm2', provider: 'openai', displayName: 'M2', contextWindow: 2000, maxOutputTokens: 200,
      capabilities: { vision: false, toolUse: false, streaming: true, functionCalling: false, jsonMode: true, embedding: false },
    });
    expect(modelRegistry.listByProvider('mock').length).toBe(1);
    expect(modelRegistry.listByProvider('openai').length).toBe(1);
  });

  it('should filter models by capability', () => {
    modelRegistry.register({
      id: 'vision-model', provider: 'mock', displayName: 'Vision', contextWindow: 1000, maxOutputTokens: 100,
      capabilities: { vision: true, toolUse: false, streaming: true, functionCalling: false, jsonMode: true, embedding: false },
    });
    modelRegistry.register({
      id: 'no-vision', provider: 'mock', displayName: 'No Vision', contextWindow: 1000, maxOutputTokens: 100,
      capabilities: { vision: false, toolUse: false, streaming: true, functionCalling: false, jsonMode: true, embedding: false },
    });
    expect(modelRegistry.listByCapability('vision').length).toBe(1);
  });

  it('should set and get default model', () => {
    modelRegistry.register({
      id: 'default-model', provider: 'mock', displayName: 'Default', contextWindow: 1000, maxOutputTokens: 100,
      capabilities: { vision: false, toolUse: false, streaming: true, functionCalling: false, jsonMode: true, embedding: false },
    });
    modelRegistry.setDefault('default-model');
    expect(modelRegistry.getDefault()?.id).toBe('default-model');
  });

  it('should return first registered as default when none set', () => {
    modelRegistry.register({
      id: 'first', provider: 'mock', displayName: 'First', contextWindow: 1000, maxOutputTokens: 100,
      capabilities: { vision: false, toolUse: false, streaming: true, functionCalling: false, jsonMode: true, embedding: false },
    });
    expect(modelRegistry.getDefault()?.id).toBe('first');
  });

  it('should clear all models', () => {
    modelRegistry.register({
      id: 'm1', provider: 'mock', displayName: 'M1', contextWindow: 1000, maxOutputTokens: 100,
      capabilities: { vision: false, toolUse: false, streaming: true, functionCalling: false, jsonMode: true, embedding: false },
    });
    modelRegistry.clear();
    expect(modelRegistry.size).toBe(0);
  });
});
