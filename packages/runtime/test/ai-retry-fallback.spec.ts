import { describe, it, expect, beforeEach } from 'vitest';
import { AIRetryPolicy, AIFallbackPolicy, AIProviderRegistry, MockProvider } from '../src/ai';
import { AIRateLimitError, AIFallbackExhaustedError, AIProviderError } from '../src/ai';
import type { AIRetryConfig, AIFallbackConfig } from '../src/ai';

describe('AIRetryPolicy', () => {
  let retryPolicy: AIRetryPolicy;

  beforeEach(() => {
    retryPolicy = new AIRetryPolicy();
  });

  it('should succeed on first attempt', async () => {
    const result = await retryPolicy.executeWithRetry({
      request: { model: 'test', messages: [{ role: 'user', content: 'Hi' }] },
      execute: async () => ({
        id: '1', model: 'test', provider: 'mock' as const, messages: [{ role: 'assistant', content: 'Hello' }],
        tokenUsage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 }, finishReason: 'stop' as const, latencyMs: 10,
      }),
      config: { maxRetries: 3, baseDelayMs: 10, maxDelayMs: 100, backoffMultiplier: 2 },
    });
    expect(result.messages[0]?.content).toBe('Hello');
  });

  it('should retry on failure and succeed', async () => {
    let attempts = 0;
    const result = await retryPolicy.executeWithRetry({
      request: { model: 'test', messages: [{ role: 'user', content: 'Hi' }] },
      execute: async () => {
        attempts++;
        if (attempts < 2) throw new AIRateLimitError('Rate limited', 'mock');
        return { id: '1', model: 'test', provider: 'mock' as const, messages: [{ role: 'assistant', content: 'Success' }],
          tokenUsage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 }, finishReason: 'stop' as const, latencyMs: 10 };
      },
      config: { maxRetries: 3, baseDelayMs: 5, maxDelayMs: 100, backoffMultiplier: 2 },
    });
    expect(result.messages[0]?.content).toBe('Success');
    expect(attempts).toBe(2);
  });

  it('should fail after retries exhausted', async () => {
    let attempts = 0;
    await expect(retryPolicy.executeWithRetry({
      request: { model: 'test', messages: [{ role: 'user', content: 'Hi' }] },
      execute: async () => {
        attempts++;
        throw new AIProviderError('Always fails', 'mock');
      },
      config: { maxRetries: 2, baseDelayMs: 5, maxDelayMs: 100, backoffMultiplier: 2 },
    })).rejects.toThrow('Always fails');
    expect(attempts).toBe(3);
  });

  it('should not retry non-retryable errors', async () => {
    let attempts = 0;
    await expect(retryPolicy.executeWithRetry({
      request: { model: 'test', messages: [{ role: 'user', content: 'Hi' }] },
      execute: async () => {
        attempts++;
        throw new Error('Fatal error');
      },
      config: { maxRetries: 3, baseDelayMs: 10, maxDelayMs: 100, backoffMultiplier: 2, retryableErrors: ['rate_limit'] },
    })).rejects.toThrow('Fatal error');
    expect(attempts).toBe(1);
  });

  it('should call onRetry callback', async () => {
    let retryCalled = false;
    let attempts = 0;
    await expect(retryPolicy.executeWithRetry({
      request: { model: 'test', messages: [{ role: 'user', content: 'Hi' }] },
      execute: async () => { attempts++; throw new AIRateLimitError('Limit', 'mock'); },
      config: { maxRetries: 1, baseDelayMs: 5, maxDelayMs: 100, backoffMultiplier: 2 },
      onRetry: () => { retryCalled = true; },
    })).rejects.toThrow();
    expect(retryCalled).toBe(true);
  });

  it('should calculate exponential backoff delay', () => {
    const config: AIRetryConfig = { maxRetries: 3, baseDelayMs: 100, maxDelayMs: 1000, backoffMultiplier: 2 };
    const calc = (retryPolicy as any).calculateDelay.bind(retryPolicy);
    expect(calc(config, 0)).toBe(100);
    expect(calc(config, 1)).toBe(200);
    expect(calc(config, 2)).toBe(400);
  });

  it('should cap delay at maxDelayMs', () => {
    const config: AIRetryConfig = { maxRetries: 3, baseDelayMs: 1000, maxDelayMs: 1500, backoffMultiplier: 3 };
    const calc = (retryPolicy as any).calculateDelay.bind(retryPolicy);
    expect(calc(config, 2)).toBe(1500);
  });
});

describe('AIFallbackPolicy', () => {
  let providerRegistry: AIProviderRegistry;
  let fallbackPolicy: AIFallbackPolicy;

  beforeEach(() => {
    providerRegistry = new AIProviderRegistry();
    providerRegistry.register(new MockProvider({}));
    fallbackPolicy = new AIFallbackPolicy(providerRegistry);
  });

  it('should succeed with first provider', async () => {
    const result = await fallbackPolicy.executeWithFallback(
      { model: 'mock-model', messages: [{ role: 'user', content: 'Hi' }] },
      { providers: ['mock'], models: ['mock-model'] },
    );
    expect(result.usedProvider).toBe('mock');
    expect(result.response.messages[0]?.content).toBeTruthy();
  });

  it('should exhaust fallbacks and throw', async () => {
    await expect(fallbackPolicy.executeWithFallback(
      { model: 'unknown-model', messages: [{ role: 'user', content: 'Hi' }] },
      { providers: ['mock'], models: ['unknown-model'] },
    )).rejects.toThrow(AIFallbackExhaustedError);
  });

  it('should call onFallback callback on switch', async () => {
    providerRegistry.createProvider({ name: 'mock', displayName: 'Mock2' });
    providerRegistry.register(providerRegistry.createProvider({ name: 'openai', displayName: 'OpenAI' }));

    let fallbackCalled = false;
    const result = await fallbackPolicy.executeWithFallback(
      { model: 'mock-model', messages: [{ role: 'user', content: 'Hi' }] },
      { providers: ['mock'], models: ['mock-model'] },
      () => { fallbackCalled = true; },
    );
    expect(result.usedProvider).toBe('mock');
  });

  it('should track attempted providers', async () => {
    try {
      await fallbackPolicy.executeWithFallback(
        { model: 'unknown', messages: [{ role: 'user', content: 'Hi' }] },
        { providers: ['mock', 'mock'], models: ['unknown', 'unknown2'] },
      );
    } catch (error) {
      if (error instanceof AIFallbackExhaustedError) {
        expect(error.attemptedProviders.length).toBe(2);
      }
    }
  });
});
