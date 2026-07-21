import type { AIRequest } from '@storynaram/runtime';
import type { AIRuntimeService } from '@storynaram/runtime';

export type StreamChunkType = 'token' | 'chapter:start' | 'chapter:complete' | 'done' | 'error';

export interface StreamChunk {
  type: StreamChunkType;
  delta?: string;
  content?: string;
  chapterNumber: number;
  chunkIndex: number;
  isComplete: boolean;
  finishReason?: string | null;
  latencyMs?: number;
  timeToFirstTokenMs?: number;
  tokenUsage?: { inputTokens: number; outputTokens: number; totalTokens: number };
  error?: string;
}

export type StreamCallback = (chunk: StreamChunk) => void | Promise<void>;

export class StreamingCoordinator {
  private activeStreams: Map<string, AbortController> = new Map();

  async *streamChapter(
    aiRuntime: AIRuntimeService,
    request: AIRequest,
    chapterNumber: number,
    options: { signal?: AbortSignal },
  ): AsyncGenerator<StreamChunk> {
    const streamId = `chapter-${chapterNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const controller = new AbortController();
    this.activeStreams.set(streamId, controller);

    const externalSignal = options.signal;
    const abortHandler = () => { if (!controller.signal.aborted) controller.abort(); };
    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort();
      } else {
        externalSignal.addEventListener('abort', abortHandler, { once: true });
      }
    }

    let accumulatedContent = '';
    let outputTokens = 0;
    let timeToFirstTokenMs = 0;
    let hasYieldedToken = false;
    const chapterStartTime = Date.now();

    yield {
      type: 'chapter:start',
      delta: '',
      chapterNumber,
      chunkIndex: 0,
      isComplete: false,
    };

    try {
      const generator = aiRuntime.generateStream(
        { ...request, stream: true },
        { sessionId: streamId },
      );

      let chunkIndex = 1;

      for await (const chunk of generator) {
        if (controller.signal.aborted) break;

        const now = Date.now();
        if (!hasYieldedToken && chunk.delta) {
          timeToFirstTokenMs = now - chapterStartTime;
          hasYieldedToken = true;
        }

        if (chunk.delta) {
          accumulatedContent += chunk.delta;
          outputTokens++;
        }

        if (chunk.delta || chunk.finishReason) {
          yield {
            type: 'token',
            delta: chunk.delta ?? '',
            chapterNumber,
            chunkIndex: chunkIndex++,
            isComplete: false,
            finishReason: chunk.finishReason,
            latencyMs: now - chapterStartTime,
            timeToFirstTokenMs,
            tokenUsage: chunk.tokenUsage
              ? {
                  inputTokens: chunk.tokenUsage.inputTokens,
                  outputTokens: chunk.tokenUsage.outputTokens,
                  totalTokens: chunk.tokenUsage.totalTokens,
                }
              : undefined,
          };
        }

        if (chunk.finishReason === 'stop' || chunk.finishReason === 'length') break;
      }

      const totalLatencyMs = Date.now() - chapterStartTime;

      yield {
        type: 'chapter:complete',
        content: accumulatedContent,
        chapterNumber,
        chunkIndex: 0,
        isComplete: true,
        latencyMs: totalLatencyMs,
        timeToFirstTokenMs,
        tokenUsage: { inputTokens: 0, outputTokens, totalTokens: outputTokens },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      yield {
        type: 'error',
        error: message,
        chapterNumber,
        chunkIndex: 0,
        isComplete: true,
      };
      throw error;
    } finally {
      if (externalSignal) {
        externalSignal.removeEventListener('abort', abortHandler);
      }
      this.activeStreams.delete(streamId);
    }
  }

  cancelStream(streamId: string): boolean {
    const controller = this.activeStreams.get(streamId);
    if (controller) {
      controller.abort();
      this.activeStreams.delete(streamId);
      return true;
    }
    return false;
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
