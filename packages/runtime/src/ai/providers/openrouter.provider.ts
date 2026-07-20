import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { AIRequest, AIResponse, AIStreamChunk, AIProviderCapabilities, AIProviderHealth, AIModelMetadata, AIProviderName } from '../types';
import { AIProvider } from './ai-provider.interface';
import { AIProviderError, AIRateLimitError } from '../errors';
import type { AIProviderConfig } from '../types';

@Injectable()
export class OpenRouterProvider extends AIProvider {
  readonly name: AIProviderName = 'openrouter';
  readonly displayName = 'OpenRouter';
  readonly capabilities: AIProviderCapabilities = {
    streaming: true,
    toolUse: true,
    vision: true,
    functionCalling: true,
    embedding: false,
    jsonMode: true,
    maxConcurrent: 50,
  };

  private readonly logger = new Logger(OpenRouterProvider.name);
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
        id: 'anthropic/claude-sonnet-4',
        provider: 'openrouter',
        displayName: 'Claude Sonnet 4 (OpenRouter)',
        contextWindow: 200000,
        maxOutputTokens: 8192,
        capabilities: { vision: true, toolUse: true, streaming: true, functionCalling: true, jsonMode: true, embedding: false },
        pricing: { inputPer1K: 0.003, outputPer1K: 0.015, currency: 'USD' },
      },
      {
        id: 'openai/gpt-4o',
        provider: 'openrouter',
        displayName: 'GPT-4o (OpenRouter)',
        contextWindow: 128000,
        maxOutputTokens: 16384,
        capabilities: { vision: true, toolUse: true, streaming: true, functionCalling: true, jsonMode: true, embedding: false },
        pricing: { inputPer1K: 0.0025, outputPer1K: 0.01, currency: 'USD' },
      },
      {
        id: 'google/gemini-2.5-flash',
        provider: 'openrouter',
        displayName: 'Gemini 2.5 Flash (OpenRouter)',
        contextWindow: 1048576,
        maxOutputTokens: 8192,
        capabilities: { vision: true, toolUse: true, streaming: true, functionCalling: true, jsonMode: true, embedding: false },
        pricing: { inputPer1K: 0.000075, outputPer1K: 0.0003, currency: 'USD' },
      },
    ];
    for (const model of models) {
      this.models.set(model.id, model);
    }
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    if (!this.config.apiKey) return this.buildMockResponse(request, startTime);
    try {
      const response = await fetch(`${this.config.baseUrl ?? 'https://openrouter.ai/api/v1'}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(this.buildRequestBody(request)),
        signal: AbortSignal.timeout(60000),
      });
      if (!response.ok) await this.handleErrorResponse(response);
      const data = await response.json() as Record<string, unknown>;
      return this.parseResponse(data, request, startTime);
    } catch (error) {
      if (error instanceof AIProviderError || error instanceof AIRateLimitError) throw error;
      throw new AIProviderError(error instanceof Error ? error.message : String(error), 'openrouter');
    }
  }

  async *generateStream(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    const startTime = Date.now();
    if (!this.config.apiKey) { yield* this.mockStream(request, startTime); return; }
    try {
      const response = await fetch(`${this.config.baseUrl ?? 'https://openrouter.ai/api/v1'}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({ ...this.buildRequestBody(request), stream: true }),
        signal: AbortSignal.timeout(120000),
      });
      if (!response.ok) await this.handleErrorResponse(response);
      const reader = response.body?.getReader();
      if (!reader) throw new AIProviderError('No response body', 'openrouter');
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
            const delta = choices?.[0]?.delta as Record<string, unknown> | undefined;
            yield { index: index++, delta: (delta?.content as string) ?? '', finishReason: (choices?.[0]?.finish_reason as string) as AIStreamChunk['finishReason'] ?? null };
          } catch { /* skip */ }
        }
      }
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      throw new AIProviderError(error instanceof Error ? error.message : String(error), 'openrouter');
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
      if (!this.config.apiKey) return { ok: true, latencyMs: 0, lastChecked: new Date() };
      return { ok: true, latencyMs: Date.now() - start, lastChecked: new Date() };
    } catch { return { ok: false, latencyMs: Date.now() - start, lastChecked: new Date(), error: 'Connection failed' }; }
  }

  private buildRequestBody(request: AIRequest): Record<string, unknown> {
    const body: Record<string, unknown> = {
      model: request.model,
      messages: request.messages.map(m => ({
        role: m.role,
        content: m.content,
        ...(m.toolCalls ? { tool_calls: m.toolCalls } : {}),
        ...(m.toolCallId ? { tool_call_id: m.toolCallId } : {}),
      })),
    };
    if (request.temperature !== undefined) body.temperature = request.temperature;
    if (request.maxTokens !== undefined) body.max_tokens = request.maxTokens;
    if (request.topP !== undefined) body.top_p = request.topP;
    if (request.stop !== undefined) body.stop = request.stop;
    if (request.tools !== undefined) body.tools = request.tools;
    return body;
  }

  private parseResponse(data: Record<string, unknown>, request: AIRequest, startTime: number): AIResponse {
    const choice = (data.choices as Array<Record<string, unknown>>)?.[0];
    const message = choice?.message as Record<string, unknown> | undefined;
    const usage = data.usage as Record<string, unknown> | undefined;
    const inputTokens = (usage?.prompt_tokens as number) ?? 0;
    const outputTokens = (usage?.completion_tokens as number) ?? 0;
    return {
      id: (data.id as string) ?? uuid(),
      model: request.model,
      provider: 'openrouter',
      messages: [{ role: 'assistant', content: (message?.content as string) ?? '' }],
      tokenUsage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens },
      finishReason: (choice?.finish_reason as AIResponse['finishReason']) ?? 'stop',
      latencyMs: Date.now() - startTime,
    };
  }

  private buildMockResponse(request: AIRequest, startTime: number): AIResponse {
    this.logger.warn('OpenRouter provider called without API key — returning mock response');
    const inputTokens = request.messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
    return {
      id: uuid(),
      model: request.model,
      provider: 'openrouter',
      messages: [{ role: 'assistant', content: `[Mock OpenRouter response for ${request.model}]` }],
      tokenUsage: { inputTokens, outputTokens: 10, totalTokens: inputTokens + 10, estimatedCostUsd: 0 },
      finishReason: 'stop',
      latencyMs: Date.now() - startTime,
    };
  }

  private async *mockStream(request: AIRequest, startTime: number): AsyncGenerator<AIStreamChunk> {
    yield { index: 0, delta: `[Mock OpenRouter stream for ${request.model}]`, finishReason: 'stop' };
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    const status = response.status;
    const body = await response.text();
    if (status === 429) throw new AIRateLimitError(`OpenRouter rate limit: ${body}`, 'openrouter');
    throw new AIProviderError(`OpenRouter API error ${status}: ${body}`, 'openrouter', status);
  }
}
