import { Injectable, Logger } from '@nestjs/common';
import type { AIStreamChunk, AIRequest, AIResponse, AIProviderName } from '../types';
import type { AIProvider } from '../providers/ai-provider.interface';
import { AITimeoutError } from '../errors';

export interface StreamController {
  abort(): void;
  pause(): void;
  resume(): void;
}

export interface StreamEventHandlers {
  onChunk?: (chunk: AIStreamChunk) => void;
  onComplete?: (response: AIResponse) => void;
  onError?: (error: Error) => void;
  onToken?: (chunk: AIStreamChunk) => void;
}

@Injectable()
export class AIStreamingSession {
  private readonly logger = new Logger(AIStreamingSession.name);
  private aborted = false;
  private paused = false;
  private pauseResolve: (() => void) | null = null;
  private _accumulatedContent = '';
  private _accumulatedToolCalls: NonNullable<AIStreamChunk['toolCalls']> = [];

  async stream(
    provider: AIProvider,
    request: AIRequest,
    handlers?: StreamEventHandlers,
    timeoutMs?: number,
  ): Promise<AIResponse> {
    this.aborted = false;
    this._accumulatedContent = '';
    this._accumulatedToolCalls = [];
    let index = 0;

    const startTime = Date.now();

    const timeoutPromise = timeoutMs
      ? new Promise<never>((_, reject) =>
          setTimeout(() => reject(new AITimeoutError('Stream timed out', provider.name, request.model, timeoutMs)), timeoutMs),
        )
      : null;

    try {
      const generator = provider.generateStream(request);

      while (true) {
        if (this.aborted) {
          return this.buildResponse(request, startTime);
        }

        if (this.paused) {
          await new Promise<void>(resolve => { this.pauseResolve = resolve; });
        }

        const nextPromise = generator.next();
        const result = timeoutPromise
          ? await Promise.race([nextPromise, timeoutPromise])
          : await nextPromise;

        if (result.done) break;

        const chunk = result.value;
        index = chunk.index;

        if (chunk.delta) this._accumulatedContent += chunk.delta;
        if (chunk.toolCalls) this._accumulatedToolCalls.push(...chunk.toolCalls);

        handlers?.onChunk?.(chunk);
        handlers?.onToken?.(chunk);

        if (chunk.finishReason === 'stop' || chunk.finishReason === 'length' || chunk.finishReason === 'error') {
          const response = this.buildResponse(request, startTime, chunk);
          handlers?.onComplete?.(response);
          return response;
        }
      }

      const response = this.buildResponse(request, startTime);
      handlers?.onComplete?.(response);
      return response;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      handlers?.onError?.(err);
      throw err;
    }
  }

  abort(): void {
    this.aborted = true;
    if (this.pauseResolve) {
      this.pauseResolve();
      this.pauseResolve = null;
    }
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
    if (this.pauseResolve) {
      this.pauseResolve();
      this.pauseResolve = null;
    }
  }

  get isAborted(): boolean {
    return this.aborted;
  }

  get isPaused(): boolean {
    return this.paused;
  }

  get accumulatedContent(): string {
    return this._accumulatedContent;
  }

  private buildResponse(request: AIRequest, startTime: number, finalChunk?: AIStreamChunk): AIResponse {
    return {
      id: `stream_${Date.now()}`,
      model: request.model,
      provider: request.provider ?? 'mock',
      messages: [{ role: 'assistant', content: this._accumulatedContent, toolCalls: this._accumulatedToolCalls.length > 0 ? this._accumulatedToolCalls : undefined }],
      tokenUsage: finalChunk?.tokenUsage ?? { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      finishReason: finalChunk?.finishReason ?? 'stop',
      latencyMs: Date.now() - startTime,
    };
  }
}
