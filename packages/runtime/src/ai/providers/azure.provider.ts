import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { AIRequest, AIResponse, AIStreamChunk, AIProviderCapabilities, AIProviderHealth, AIModelMetadata, AIProviderName } from '../types.js';
import { AIProvider } from './ai-provider.interface.js';
import { AIProviderError } from '../errors.js';
import type { AIProviderConfig } from '../types.js';

@Injectable()
export class AzureProvider extends AIProvider {
  readonly name: AIProviderName = 'azure';
  readonly displayName = 'Azure OpenAI';
  readonly capabilities: AIProviderCapabilities = {
    streaming: true,
    toolUse: true,
    vision: true,
    functionCalling: true,
    embedding: true,
    jsonMode: true,
    maxConcurrent: 50,
  };

  private readonly logger = new Logger(AzureProvider.name);
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
        provider: 'azure',
        displayName: 'GPT-4o (Azure)',
        contextWindow: 128000,
        maxOutputTokens: 16384,
        capabilities: { vision: true, toolUse: true, streaming: true, functionCalling: true, jsonMode: true, embedding: false },
        pricing: { inputPer1K: 0.0025, outputPer1K: 0.01, currency: 'USD' },
      },
      {
        id: 'gpt-4o-mini',
        provider: 'azure',
        displayName: 'GPT-4o Mini (Azure)',
        contextWindow: 128000,
        maxOutputTokens: 16384,
        capabilities: { vision: true, toolUse: true, streaming: true, functionCalling: true, jsonMode: true, embedding: false },
        pricing: { inputPer1K: 0.00015, outputPer1K: 0.0006, currency: 'USD' },
      },
    ];
    for (const model of models) {
      this.models.set(model.id, model);
    }
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    if (!this.config.apiKey || !this.config.baseUrl) return this.buildMockResponse(request, startTime);
    try {
      const url = `${this.config.baseUrl}/openai/deployments/${request.model}/chat/completions?api-version=2024-08-01-preview`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.apiKey,
        },
        body: JSON.stringify(this.buildRequestBody(request)),
        signal: AbortSignal.timeout(60000),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new AIProviderError(`Azure API error ${response.status}: ${body}`, 'azure', response.status);
      }
      const data = await response.json() as Record<string, unknown>;
      return this.parseResponse(data, request, startTime);
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      throw new AIProviderError(error instanceof Error ? error.message : String(error), 'azure');
    }
  }

  async *generateStream(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    if (!this.config.apiKey || !this.config.baseUrl) { yield* this.mockStream(request, Date.now()); return; }
    try {
      const url = `${this.config.baseUrl}/openai/deployments/${request.model}/chat/completions?api-version=2024-08-01-preview`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': this.config.apiKey },
        body: JSON.stringify({ ...this.buildRequestBody(request), stream: true }),
        signal: AbortSignal.timeout(120000),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new AIProviderError(`Azure API error ${response.status}: ${body}`, 'azure', response.status);
      }
      const reader = response.body?.getReader();
      if (!reader) throw new AIProviderError('No response body', 'azure');
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
      throw new AIProviderError(error instanceof Error ? error.message : String(error), 'azure');
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
      if (!this.config.apiKey || !this.config.baseUrl) return { ok: true, latencyMs: 0, lastChecked: new Date() };
      return { ok: true, latencyMs: Date.now() - start, lastChecked: new Date() };
    } catch { return { ok: false, latencyMs: Date.now() - start, lastChecked: new Date(), error: 'Connection failed' }; }
  }

  private buildRequestBody(request: AIRequest): Record<string, unknown> {
    const body: Record<string, unknown> = {
      messages: request.messages.map(m => ({ role: m.role, content: m.content, ...(m.toolCalls ? { tool_calls: m.toolCalls } : {}), ...(m.toolCallId ? { tool_call_id: m.toolCallId } : {}) })),
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
      provider: 'azure',
      messages: [{ role: 'assistant', content: (message?.content as string) ?? '' }],
      tokenUsage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens },
      finishReason: (choice?.finish_reason as AIResponse['finishReason']) ?? 'stop',
      latencyMs: Date.now() - startTime,
    };
  }

  private buildMockResponse(request: AIRequest, startTime: number): AIResponse {
    this.logger.warn('Azure provider called without API key — returning mock response');
    const inputTokens = request.messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
    return {
      id: uuid(),
      model: request.model,
      provider: 'azure',
      messages: [{ role: 'assistant', content: `[Mock Azure response for ${request.model}]` }],
      tokenUsage: { inputTokens, outputTokens: 10, totalTokens: inputTokens + 10, estimatedCostUsd: 0 },
      finishReason: 'stop',
      latencyMs: Date.now() - startTime,
    };
  }

  private async *mockStream(request: AIRequest, startTime: number): AsyncGenerator<AIStreamChunk> {
    yield { index: 0, delta: `[Mock Azure stream for ${request.model}]`, finishReason: 'stop' };
  }
}
