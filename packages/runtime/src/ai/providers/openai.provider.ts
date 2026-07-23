import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { AIRequest, AIResponse, AIStreamChunk, AIProviderCapabilities, AIProviderHealth, AIModelMetadata, AIProviderName } from '../types.js';
import { AIProvider } from './ai-provider.interface.js';
import { AIRuntimeError, AIProviderError, AIModelError, AITimeoutError, AIRateLimitError } from '../errors.js';
import type { AIProviderConfig } from '../types.js';

@Injectable()
export class OpenAIProvider extends AIProvider {
  readonly name: AIProviderName = 'openai';
  readonly displayName = 'OpenAI';
  readonly capabilities: AIProviderCapabilities = {
    streaming: true,
    toolUse: true,
    vision: true,
    functionCalling: true,
    embedding: true,
    jsonMode: true,
    maxConcurrent: 50,
  };

  private readonly logger = new Logger(OpenAIProvider.name);
  private readonly config: AIProviderConfig;
  private readonly models: Map<string, AIModelMetadata> = new Map();

  constructor(config: AIProviderConfig) {
    super();
    this.config = config;
    this.registerModels();
  }

  private registerModels(): void {
    const models: AIModelMetadata[] = [
      {
        id: 'gpt-4o',
        provider: 'openai',
        displayName: 'GPT-4o',
        contextWindow: 128000,
        maxOutputTokens: 16384,
        capabilities: { vision: true, toolUse: true, streaming: true, functionCalling: true, jsonMode: true, embedding: false },
        pricing: { inputPer1K: 0.0025, outputPer1K: 0.01, currency: 'USD' },
      },
      {
        id: 'gpt-4o-mini',
        provider: 'openai',
        displayName: 'GPT-4o Mini',
        contextWindow: 128000,
        maxOutputTokens: 16384,
        capabilities: { vision: true, toolUse: true, streaming: true, functionCalling: true, jsonMode: true, embedding: false },
        pricing: { inputPer1K: 0.00015, outputPer1K: 0.0006, currency: 'USD' },
      },
      {
        id: 'o3-mini',
        provider: 'openai',
        displayName: 'o3 Mini',
        contextWindow: 200000,
        maxOutputTokens: 100000,
        capabilities: { vision: true, toolUse: true, streaming: true, functionCalling: true, jsonMode: true, embedding: false },
        pricing: { inputPer1K: 0.0011, outputPer1K: 0.0044, currency: 'USD' },
      },
      {
        id: 'gpt-4.1-nano',
        provider: 'openai',
        displayName: 'GPT-4.1 Nano',
        contextWindow: 1048576,
        maxOutputTokens: 32768,
        capabilities: { vision: true, toolUse: true, streaming: true, functionCalling: true, jsonMode: true, embedding: false },
        pricing: { inputPer1K: 0.0001, outputPer1K: 0.0004, currency: 'USD' },
      },
      {
        id: 'text-embedding-3-small',
        provider: 'openai',
        displayName: 'Text Embedding 3 Small',
        contextWindow: 8191,
        maxOutputTokens: 1,
        capabilities: { vision: false, toolUse: false, streaming: false, functionCalling: false, jsonMode: false, embedding: true },
        pricing: { inputPer1K: 0.00002, outputPer1K: 0, currency: 'USD' },
      },
    ];
    for (const model of models) {
      this.models.set(model.id, model);
    }
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    if (!this.config.apiKey) {
      return this.buildMockResponse(request, startTime);
    }
    try {
      const response = await fetch(`${this.config.baseUrl ?? 'https://api.openai.com/v1'}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          ...(this.config.organization ? { 'OpenAI-Organization': this.config.organization } : {}),
        },
        body: JSON.stringify(this.buildRequestBody(request)),
        signal: AbortSignal.timeout(60000),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json() as Record<string, unknown>;
      return this.parseResponse(data, request, startTime);
    } catch (error) {
      if (error instanceof AIRuntimeError) throw error;
      throw new AIProviderError(
        error instanceof Error ? error.message : String(error),
        'openai',
      );
    }
  }

  async *generateStream(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    const startTime = Date.now();
    if (!this.config.apiKey) {
      yield* this.mockStream(request, startTime);
      return;
    }
    try {
      const response = await fetch(`${this.config.baseUrl ?? 'https://api.openai.com/v1'}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({ ...this.buildRequestBody(request), stream: true, stream_options: { include_usage: true } }),
        signal: AbortSignal.timeout(120000),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new AIProviderError('No response body', 'openai');

      const decoder = new TextDecoder();
      let buffer = '';
      let index = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data) as Record<string, unknown>;
            const choices = parsed.choices as Array<Record<string, unknown>> | undefined;
            const choice = choices?.[0];
            if (!choice) continue;

            const delta = choice.delta as Record<string, unknown> | undefined;
            const content = delta?.content as string | undefined;
            const finishReason = choice.finish_reason as string | null;

            const usage = parsed.usage as Record<string, unknown> | undefined;

            yield {
              index: index++,
              delta: content ?? '',
              finishReason: finishReason as AIStreamChunk['finishReason'],
              tokenUsage: usage ? {
                inputTokens: usage.prompt_tokens as number,
                outputTokens: usage.completion_tokens as number,
                totalTokens: usage.total_tokens as number,
              } : undefined,
            };
          } catch {
            // skip malformed JSON lines
          }
        }
      }
    } catch (error) {
      if (error instanceof AIRuntimeError) throw error;
      throw new AIProviderError(
        error instanceof Error ? error.message : String(error),
        'openai',
      );
    }
  }

  async countTokens(messages: { role: string; content: string }[]): Promise<number> {
    return messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
  }

  getModel(modelId: string): AIModelMetadata | undefined {
    return this.models.get(modelId);
  }

  listModels(): AIModelMetadata[] {
    return Array.from(this.models.values());
  }

  async health(): Promise<AIProviderHealth> {
    const start = Date.now();
    try {
      if (!this.config.apiKey) {
        return { ok: true, latencyMs: 0, lastChecked: new Date() };
      }
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${this.config.apiKey}` },
        signal: AbortSignal.timeout(5000),
      });
      return {
        ok: response.ok,
        latencyMs: Date.now() - start,
        lastChecked: new Date(),
        error: response.ok ? undefined : `HTTP ${response.status}`,
      };
    } catch {
      return { ok: false, latencyMs: Date.now() - start, lastChecked: new Date(), error: 'Connection failed' };
    }
  }

  private buildRequestBody(request: AIRequest): Record<string, unknown> {
    const body: Record<string, unknown> = {
      model: request.model,
      messages: request.messages.map(m => ({
        role: m.role,
        content: m.content,
        ...(m.toolCalls ? { tool_calls: m.toolCalls } : {}),
        ...(m.toolCallId ? { tool_call_id: m.toolCallId } : {}),
        ...(m.name ? { name: m.name } : {}),
      })),
    };
    if (request.temperature !== undefined) body.temperature = request.temperature;
    if (request.maxTokens !== undefined) body.max_tokens = request.maxTokens;
    if (request.topP !== undefined) body.top_p = request.topP;
    if (request.stop !== undefined) body.stop = request.stop;
    if (request.tools !== undefined) body.tools = request.tools;
    if (request.toolChoice !== undefined) body.tool_choice = request.toolChoice;
    return body;
  }

  private parseResponse(data: Record<string, unknown>, request: AIRequest, startTime: number): AIResponse {
    const choice = (data.choices as Array<Record<string, unknown>>)?.[0];
    const message = choice?.message as Record<string, unknown> | undefined;
    const usage = data.usage as Record<string, unknown> | undefined;

    const inputTokens = (usage?.prompt_tokens as number) ?? 0;
    const outputTokens = (usage?.completion_tokens as number) ?? 0;
    const pricing = this.models.get(request.model)?.pricing;
    const estimatedCostUsd = pricing
      ? (inputTokens / 1000) * pricing.inputPer1K + (outputTokens / 1000) * pricing.outputPer1K
      : undefined;

    return {
      id: (data.id as string) ?? uuid(),
      model: request.model,
      provider: 'openai',
      messages: [{
        role: 'assistant',
        content: (message?.content as string) ?? '',
      }],
      tokenUsage: { inputTokens, outputTokens, totalTokens: (usage?.total_tokens as number) ?? 0, estimatedCostUsd },
      finishReason: (choice?.finish_reason as AIResponse['finishReason']) ?? 'stop',
      latencyMs: Date.now() - startTime,
    };
  }

  private buildMockResponse(request: AIRequest, startTime: number): AIResponse {
    this.logger.warn('OpenAI provider called without API key — returning mock response');
    const inputTokens = request.messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
    return {
      id: uuid(),
      model: request.model,
      provider: 'openai',
      messages: [{ role: 'assistant', content: `[Mock OpenAI response for ${request.model}]` }],
      tokenUsage: { inputTokens, outputTokens: 10, totalTokens: inputTokens + 10, estimatedCostUsd: 0 },
      finishReason: 'stop',
      latencyMs: Date.now() - startTime,
    };
  }

  private async *mockStream(request: AIRequest, startTime: number): AsyncGenerator<AIStreamChunk> {
    this.logger.warn('OpenAI provider called without API key — returning mock stream');
    yield { index: 0, delta: `[Mock OpenAI stream for ${request.model}]`, finishReason: 'stop' };
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    const status = response.status;
    const body = await response.text();
    if (status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new AIRateLimitError(`OpenAI rate limit: ${body}`, 'openai', retryAfter ? parseInt(retryAfter) * 1000 : undefined);
    }
    throw new AIProviderError(`OpenAI API error ${status}: ${body}`, 'openai', status);
  }
}
