import { describe, it, expect, vi } from 'vitest';
import { StreamingCoordinator } from '../src/output/streaming-coordinator';

describe('StreamingCoordinator', () => {
  it('streams token chunks from AI runtime async generator', async () => {
    const coordinator = new StreamingCoordinator();
    const mockGenerateStream = vi.fn().mockImplementation(async function* () {
      yield { index: 0, delta: 'Once upon ', finishReason: null };
      yield { index: 1, delta: 'a time in ', finishReason: null };
      yield { index: 2, delta: 'a faraway land...', finishReason: 'stop' };
    });

    const chunks: any[] = [];
    for await (const chunk of coordinator.streamChapter(
      { generateStream: mockGenerateStream } as any,
      { model: 'gpt-4', messages: [{ role: 'user', content: 'Write a story' }] },
      1,
      {},
    )) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBeGreaterThan(1);
    const tokenChunks = chunks.filter(c => c.type === 'token');
    expect(tokenChunks.length).toBe(3);
    expect(tokenChunks[0]!.delta).toBe('Once upon ');
    expect(tokenChunks[1]!.delta).toBe('a time in ');
    expect(tokenChunks[2]!.delta).toBe('a faraway land...');
    expect(chunks.some(c => c.type === 'chapter:start')).toBe(true);
    expect(chunks.some(c => c.type === 'chapter:complete')).toBe(true);
  });

  it('emits chapter:start then tokens then chapter:complete in order', async () => {
    const coordinator = new StreamingCoordinator();
    const mockGenerateStream = vi.fn().mockImplementation(async function* () {
      yield { index: 0, delta: 'hello world', finishReason: 'stop' };
    });

    const chunkTypes: string[] = [];
    for await (const chunk of coordinator.streamChapter(
      { generateStream: mockGenerateStream } as any,
      { model: 'gpt-4', messages: [] },
      5,
      {},
    )) {
      chunkTypes.push(chunk.type);
    }

    expect(chunkTypes[0]).toBe('chapter:start');
    expect(chunkTypes[chunkTypes.length - 1]).toBe('chapter:complete');
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
