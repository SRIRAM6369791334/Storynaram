import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { AIRequest, AIResponse, AIStreamChunk, AIProviderCapabilities, AIProviderHealth, AIModelMetadata, AIProviderName } from '../types';
import { AIProvider } from './ai-provider.interface';
import { AIProviderError, AIRateLimitError } from '../errors';
import type { AIProviderConfig } from '../types';

@Injectable()
export class AnthropicProvider extends AIProvider {
  readonly name: AIProviderName = 'anthropic';
  readonly displayName = 'Anthropic';
  readonly capabilities: AIProviderCapabilities = {
    streaming: true,
    toolUse: true,
    vision: true,
    functionCalling: true,
    embedding: false,
    jsonMode: true,
    maxConcurrent: 40,
  };

  private readonly logger = new Logger(AnthropicProvider.name);
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
        id: 'claude-sonnet-4-20250514',
        provider: 'anthropic',
        displayName: 'Claude Sonnet 4',
        contextWindow: 200000,
        maxOutputTokens: 8192,
        capabilities: { vision: true, toolUse: true, streaming: true, functionCalling: true, jsonMode: true, embedding: false },
        pricing: { inputPer1K: 0.003, outputPer1K: 0.015, currency: 'USD' },
      },
      {
        id: 'claude-haiku-3-5-20241022',
        provider: 'anthropic',
        displayName: 'Claude Haiku 3.5',
        contextWindow: 200000,
        maxOutputTokens: 8192,
        capabilities: { vision: true, toolUse: true, streaming: true, functionCalling: true, jsonMode: true, embedding: false },
        pricing: { inputPer1K: 0.0008, outputPer1K: 0.004, currency: 'USD' },
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
      const response = await fetch(`${this.config.baseUrl ?? 'https://api.anthropic.com/v1'}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(this.buildRequestBody(request)),
        signal: AbortSignal.timeout(60000),
      });
      if (!response.ok) await this.handleErrorResponse(response);
      const data = await response.json() as Record<string, unknown>;
      return this.parseResponse(data, request, startTime);
    } catch (error) {
      if (error instanceof AIProviderError || error instanceof AIRateLimitError) throw error;
      throw new AIProviderError(error instanceof Error ? error.message : String(error), 'anthropic');
    }
  }

  async *generateStream(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    const startTime = Date.now();
    if (!this.config.apiKey) {
      yield* this.mockStream(request, startTime);
      return;
    }
    try {
      const response = await fetch(`${this.config.baseUrl ?? 'https://api.anthropic.com/v1'}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({ ...this.buildRequestBody(request), stream: true }),
        signal: AbortSignal.timeout(120000),
      });
      if (!response.ok) await this.handleErrorResponse(response);
      const reader = response.body?.getReader();
      if (!reader) throw new AIProviderError('No response body', 'anthropic');
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
          try {
            const parsed = JSON.parse(data) as Record<string, unknown>;
            if (parsed.type === 'content_block_delta') {
              const delta = parsed.delta as Record<string, unknown> | undefined;
              yield { index: index++, delta: (delta?.text as string) ?? '', finishReason: null };
            } else if (parsed.type === 'message_stop') {
              yield { index: index++, delta: '', finishReason: 'stop' };
            }
          } catch { /* skip */ }
        }
      }
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      throw new AIProviderError(error instanceof Error ? error.message : String(error), 'anthropic');
    }
  }

  async countTokens(messages: { role: string; content: string }[]): Promise<number> {
    return messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 3.5), 0);
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
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': this.config.apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-haiku-3-5-20241022', max_tokens: 1, messages: [{ role: 'user', content: 'ping' }] }),
        signal: AbortSignal.timeout(5000),
      });
      return { ok: response.ok, latencyMs: Date.now() - start, lastChecked: new Date(), error: response.ok ? undefined : `HTTP ${response.status}` };
    } catch { return { ok: false, latencyMs: Date.now() - start, lastChecked: new Date(), error: 'Connection failed' }; }
  }

  private buildRequestBody(request: AIRequest): Record<string, unknown> {
    const systemMessages = request.messages.filter(m => m.role === 'system');
    const otherMessages = request.messages.filter(m => m.role !== 'system');
    const body: Record<string, unknown> = {
      model: request.model,
      max_tokens: request.maxTokens ?? 4096,
      messages: otherMessages.map(m => ({
        role: m.role === 'developer' ? 'user' : m.role,
        content: m.content,
        ...(m.toolCalls ? { tool_calls: m.toolCalls } : {}),
        ...(m.toolCallId ? { tool_call_id: m.toolCallId } : {}),
      })),
    };
    if (systemMessages.length > 0) body.system = systemMessages.map(m => m.content).join('\n');
    if (request.temperature !== undefined) body.temperature = request.temperature;
    if (request.topP !== undefined) body.top_p = request.topP;
    if (request.stop !== undefined) body.stop_sequences = request.stop;
    if (request.tools !== undefined) body.tools = request.tools;
    return body;
  }

  private parseResponse(data: Record<string, unknown>, request: AIRequest, startTime: number): AIResponse {
    const content = (data.content as Array<Record<string, unknown>>)?.[0];
    const text = content?.text as string ?? '';
    const usage = data.usage as Record<string, unknown> | undefined;
    const inputTokens = (usage?.input_tokens as number) ?? 0;
    const outputTokens = (usage?.output_tokens as number) ?? 0;
    const pricing = this.models.get(request.model)?.pricing;
    const estimatedCostUsd = pricing ? (inputTokens / 1000) * pricing.inputPer1K + (outputTokens / 1000) * pricing.outputPer1K : undefined;
    return {
      id: (data.id as string) ?? uuid(),
      model: request.model,
      provider: 'anthropic',
      messages: [{ role: 'assistant', content: text }],
      tokenUsage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens, estimatedCostUsd },
      finishReason: (data.stop_reason as AIResponse['finishReason']) ?? 'stop',
      latencyMs: Date.now() - startTime,
    };
  }

  private buildMockResponse(request: AIRequest, startTime: number): AIResponse {
    this.logger.warn('Anthropic provider called without API key — returning mock response');
    const inputTokens = request.messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 3.5), 0);
    return {
      id: uuid(),
      model: request.model,
      provider: 'anthropic',
      messages: [{ role: 'assistant', content: `[Mock Anthropic response for ${request.model}]` }],
      tokenUsage: { inputTokens, outputTokens: 10, totalTokens: inputTokens + 10, estimatedCostUsd: 0 },
      finishReason: 'stop',
      latencyMs: Date.now() - startTime,
    };
  }

  private async *mockStream(request: AIRequest, startTime: number): AsyncGenerator<AIStreamChunk> {
    yield { index: 0, delta: `[Mock Anthropic stream for ${request.model}]`, finishReason: 'stop' };
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    const status = response.status;
    const body = await response.text();
    if (status === 429) throw new AIRateLimitError(`Anthropic rate limit: ${body}`, 'anthropic');
    throw new AIProviderError(`Anthropic API error ${status}: ${body}`, 'anthropic', status);
  }
}
