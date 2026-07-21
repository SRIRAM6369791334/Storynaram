import type { AIResponse, AIRequest } from '@storynaram/runtime';
import type { AIRuntimeService } from '@storynaram/runtime';

export interface StreamChunk {
  content: string;
  chapterNumber: number;
  chunkIndex: number;
  isComplete: boolean;
}

export type StreamCallback = (chunk: StreamChunk) => void | Promise<void>;

export class StreamingCoordinator {
  private activeStreams: Map<string, AbortController> = new Map();

  async streamChapter(
    aiRuntime: AIRuntimeService,
    request: AIRequest,
    chapterNumber: number,
    options: { onChunk?: StreamCallback; signal?: AbortSignal },
  ): Promise<{ content: string; tokenUsage: { inputTokens: number; outputTokens: number; totalTokens: number }; latencyMs: number }> {
    const streamId = `chapter-${chapterNumber}-${Date.now()}`;
    const controller = new AbortController();
    this.activeStreams.set(streamId, controller);

    try {
      const startTime = Date.now();
      const response = await aiRuntime.generate(
        { ...request, stream: true },
        { sessionId: streamId },
      );

      const content = response.messages[response.messages.length - 1]?.content ?? '';

      if (options.onChunk) {
        const words = content.split(' ');
        const chunkSize = Math.ceil(words.length / 5);
        for (let i = 0; i < 5; i++) {
          const chunkWords = words.slice(i * chunkSize, (i + 1) * chunkSize);
          if (chunkWords.length > 0) {
            await options.onChunk({
              content: chunkWords.join(' '),
              chapterNumber,
              chunkIndex: i,
              isComplete: i === 4,
            });
          }
        }
      }

      this.activeStreams.delete(streamId);
      return {
        content,
        tokenUsage: response.tokenUsage,
        latencyMs: Date.now() - startTime,
      };
    } catch (error) {
      this.activeStreams.delete(streamId);
      throw error;
    }
  }

  cancelStream(streamId: string): void {
    const controller = this.activeStreams.get(streamId);
    if (controller) {
      controller.abort();
      this.activeStreams.delete(streamId);
    }
  }

  cancelAll(): void {
    for (const [id, controller] of this.activeStreams) {
      controller.abort();
    }
    this.activeStreams.clear();
  }

  get activeCount(): number {
    return this.activeStreams.size;
  }
}
