import { describe, it, expect, beforeEach } from 'vitest';
import { MockProvider, AIStreamingSession } from '../src/ai';

describe('AIStreamingSession', () => {
  let provider: MockProvider;
  let streaming: AIStreamingSession;

  beforeEach(() => {
    provider = new MockProvider({});
    streaming = new AIStreamingSession();
  });

  it('should stream response chunks', async () => {
    const chunks: string[] = [];
    const response = await streaming.stream(provider, {
      model: 'mock-model',
      messages: [{ role: 'user', content: 'Hello world' }],
      stream: true,
    }, {
      onChunk: (chunk) => { chunks.push(chunk.delta); },
    });
    expect(chunks.length).toBeGreaterThan(0);
    expect(response.messages[0]?.content).toBeTruthy();
    expect(response.finishReason).toBe('stop');
  });

  it('should support stream cancellation', async () => {
    const chunks: string[] = [];
    const streamPromise = streaming.stream(provider, {
      model: 'mock-model',
      messages: [{ role: 'user', content: 'Hello world' }],
      stream: true,
    }, {
      onChunk: (chunk) => {
        chunks.push(chunk.delta);
        if (chunks.length >= 1) streaming.abort();
      },
    });
    const response = await streamPromise;
    expect(response).toBeDefined();
    expect(streaming.isAborted).toBe(true);
  });

  it('should support pause and resume', async () => {
    streaming.pause();
    expect(streaming.isPaused).toBe(true);
    streaming.resume();
    expect(streaming.isPaused).toBe(false);
  });

  it('should call onComplete handler', async () => {
    let completed = false;
    await streaming.stream(provider, {
      model: 'mock-model',
      messages: [{ role: 'user', content: 'Hello' }],
    }, {
      onComplete: () => { completed = true; },
    });
    expect(completed).toBe(true);
  });

  it('should call onError on stream failure', async () => {
    const failingProvider = new MockProvider({ failureRate: 1 });
    let errorCalled = false;
    await expect(streaming.stream(failingProvider, {
      model: 'mock-model',
      messages: [{ role: 'user', content: 'Hello' }],
    }, {
      onError: () => { errorCalled = true; },
    })).rejects.toThrow();
    expect(errorCalled).toBe(true);
  });

  it('should accumulate content correctly', async () => {
    await streaming.stream(provider, {
      model: 'mock-model',
      messages: [{ role: 'user', content: 'Hello world' }],
    });
    expect(streaming.accumulatedContent.length).toBeGreaterThan(0);
  });

  it('should handle timeout', async () => {
    const slowProvider = new MockProvider({ simulateLatencyMs: 200 });
    await expect(streaming.stream(slowProvider, {
      model: 'mock-model',
      messages: [{ role: 'user', content: 'Hello' }],
    }, {}, 50)).rejects.toThrow(/timed out/);
  });
});
