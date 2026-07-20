import { bench, describe } from 'vitest';
import { MockProvider, AIProviderRegistry, AIModelRegistry, AIPromptBuilder, AICacheService, AICostTracker, AIRetryPolicy } from '../src/ai';

describe('AI Runtime Benchmarks', () => {
  const provider = new MockProvider({});
  const request = {
    model: 'mock-model',
    messages: [{ role: 'user', content: 'Hello world, this is a benchmark test message for the AI runtime foundation.' }],
  };

  bench('mock provider generate', async () => {
    await provider.generate(request);
  }, { iterations: 100 });

  bench('mock provider stream', async () => {
    const generator = provider.generateStream(request);
    for await (const _chunk of generator) {
      // consume stream
    }
  }, { iterations: 50 });

  bench('mock provider count tokens', async () => {
    await provider.countTokens(request.messages);
  }, { iterations: 1000 });
});

describe('Registry Benchmarks', () => {
  const registry = new AIProviderRegistry();
  const modelRegistry = new AIModelRegistry();

  bench('provider registry resolve', () => {
    registry.register(new MockProvider({}));
    registry.resolve('mock');
    registry.unregister('mock');
  }, { iterations: 500 });

  bench('model registry operations', () => {
    modelRegistry.register({
      id: 'bench-model', provider: 'mock', displayName: 'Bench', contextWindow: 1000, maxOutputTokens: 100,
      capabilities: { vision: false, toolUse: false, streaming: true, functionCalling: false, jsonMode: true, embedding: false },
    });
    modelRegistry.resolve('bench-model');
    modelRegistry.unregister('bench-model');
  }, { iterations: 500 });
});

describe('Prompt Builder Benchmarks', () => {
  const builder = AIPromptBuilder.create();

  bench('build simple prompt', () => {
    builder.reset();
    builder.addSystem('You are a helpful assistant.').addUser('What is the meaning of life?').build();
  }, { iterations: 1000 });

  bench('render template', () => {
    builder.reset();
    builder.renderTemplate(
      { id: 't1', version: '1.0', name: 'test', template: 'Hello {{name}}, you are {{age}} years old and live in {{city}}', variables: ['name', 'age', 'city'] },
      { name: 'Alice', age: '30', city: 'New York' },
    );
  }, { iterations: 500 });
});

describe('Cache Benchmarks', () => {
  const cache = new AICacheService(60000);
  const key = cache.generateKey({ model: 'm', messages: [{ role: 'user', content: 'test' }] });
  const response = {
    id: 'r1', model: 'm', provider: 'mock' as const, messages: [{ role: 'assistant' as const, content: 'test' }],
    tokenUsage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 }, finishReason: 'stop' as const, latencyMs: 0,
  };

  bench('cache set and get', () => {
    cache.set(key, response);
    cache.get(key);
  }, { iterations: 1000 });

  bench('cache key generation', () => {
    cache.generateKey({ model: 'gpt-4o', messages: [{ role: 'user', content: 'Hello world' }] });
  }, { iterations: 5000 });
});

describe('Retry Benchmarks', () => {
  const retryPolicy = new AIRetryPolicy();

  bench('retry successful first attempt', async () => {
    await retryPolicy.executeWithRetry({
      request: { model: 'test', messages: [{ role: 'user', content: 'Hi' }] },
      execute: async () => ({
        id: '1', model: 'test', provider: 'mock' as const, messages: [{ role: 'assistant' as const, content: 'Hello' }],
        tokenUsage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 }, finishReason: 'stop' as const, latencyMs: 0,
      }),
      config: { maxRetries: 3, baseDelayMs: 5, maxDelayMs: 50, backoffMultiplier: 2 },
    });
  }, { iterations: 100 });
});
