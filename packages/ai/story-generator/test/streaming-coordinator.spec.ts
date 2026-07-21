import { describe, it, expect, vi } from 'vitest';
import { StreamingCoordinator } from '../src/output/streaming-coordinator';

describe('StreamingCoordinator', () => {
  it('streams chapter content via AI runtime', async () => {
    const coordinator = new StreamingCoordinator();
    const mockGenerate = vi.fn().mockResolvedValue({
      id: 'resp-1',
      model: 'gpt-4',
      provider: 'openai',
      messages: [{ role: 'assistant', content: 'Once upon a time in a faraway land...' }],
      tokenUsage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 },
      finishReason: 'stop',
      latencyMs: 200,
    });

    const result = await coordinator.streamChapter(
      { generate: mockGenerate } as any,
      { model: 'gpt-4', messages: [{ role: 'user', content: 'Write a story' }] },
      1,
      {},
    );

    expect(result.content).toBe('Once upon a time in a faraway land...');
    expect(result.tokenUsage.totalTokens).toBe(150);
    expect(mockGenerate).toHaveBeenCalledTimes(1);
  });

  it('calls onChunk callback with stream chunks', async () => {
    const coordinator = new StreamingCoordinator();
    const onChunk = vi.fn();
    const mockGenerate = vi.fn().mockResolvedValue({
      id: 'resp-2',
      model: 'gpt-4',
      provider: 'openai',
      messages: [{ role: 'assistant', content: 'Word1 Word2 Word3 Word4 Word5 Word6 Word7 Word8 Word9 Word10' }],
      tokenUsage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
      finishReason: 'stop',
      latencyMs: 100,
    });

    await coordinator.streamChapter(
      { generate: mockGenerate } as any,
      { model: 'gpt-4', messages: [{ role: 'user', content: 'Write' }] },
      1,
      { onChunk },
    );

    expect(onChunk).toHaveBeenCalled();
    expect(onChunk.mock.calls.length).toBeGreaterThan(0);

    const firstChunk = onChunk.mock.calls[0]![0];
    expect(firstChunk.chapterNumber).toBe(1);
    expect(firstChunk.chunkIndex).toBe(0);
  });

  it('tracks active stream count', () => {
    const coordinator = new StreamingCoordinator();
    expect(coordinator.activeCount).toBe(0);
  });

  it('cancels all streams', () => {
    const coordinator = new StreamingCoordinator();
    coordinator.cancelAll();
    expect(coordinator.activeCount).toBe(0);
  });
});
