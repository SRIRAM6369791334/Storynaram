import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { AIRequest, AIResponse, AIStreamChunk, AIProviderCapabilities, AIProviderHealth, AIModelMetadata, AIProviderName } from '../types';
import { AIProvider } from './ai-provider.interface';
import { AIProviderError } from '../errors';
import type { AIProviderConfig } from '../types';

@Injectable()
export class GeminiProvider extends AIProvider {
  readonly name: AIProviderName = 'gemini';
  readonly displayName = 'Google Gemini';
  readonly capabilities: AIProviderCapabilities = {
    streaming: true,
    toolUse: true,
    vision: true,
    functionCalling: true,
    embedding: false,
    jsonMode: true,
    maxConcurrent: 60,
  };

  private readonly logger = new Logger(GeminiProvider.name);
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
        id: 'gemini-2.5-flash',
        provider: 'gemini',
        displayName: 'Gemini 2.5 Flash',
        contextWindow: 1048576,
        maxOutputTokens: 8192,
        capabilities: { vision: true, toolUse: true, streaming: true, functionCalling: true, jsonMode: true, embedding: false },
        pricing: { inputPer1K: 0.000075, outputPer1K: 0.0003, currency: 'USD' },
      },
      {
        id: 'gemini-2.5-pro',
        provider: 'gemini',
        displayName: 'Gemini 2.5 Pro',
        contextWindow: 1048576,
        maxOutputTokens: 8192,
        capabilities: { vision: true, toolUse: true, streaming: true, functionCalling: true, jsonMode: true, embedding: false },
        pricing: { inputPer1K: 0.00125, outputPer1K: 0.01, currency: 'USD' },
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
      const url = `${this.config.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta'}/models/${request.model}:generateContent?key=${this.config.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.buildRequestBody(request)),
        signal: AbortSignal.timeout(60000),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new AIProviderError(`Gemini API error ${response.status}: ${body}`, 'gemini', response.status);
      }
      const data = await response.json() as Record<string, unknown>;
      return this.parseResponse(data, request, startTime);
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      throw new AIProviderError(error instanceof Error ? error.message : String(error), 'gemini');
    }
  }

  async *generateStream(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    const startTime = Date.now();
    if (!this.config.apiKey) {
      yield* this.mockStream(request, startTime);
      return;
    }
    try {
      const url = `${this.config.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta'}/models/${request.model}:streamGenerateContent?key=${this.config.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.buildRequestBody(request)),
        signal: AbortSignal.timeout(120000),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new AIProviderError(`Gemini API error ${response.status}: ${body}`, 'gemini', response.status);
      }
      const data = await response.json() as Array<Record<string, unknown>>;
      for (let i = 0; i < data.length; i++) {
        const candidate = (data[i]?.candidates as Array<Record<string, unknown>>)?.[0];
        const content = candidate?.content as Record<string, unknown> | undefined;
        const parts = content?.parts as Array<Record<string, unknown>> | undefined;
        const text = parts?.map(p => p.text as string).join('') ?? '';
        yield { index: i, delta: text, finishReason: i === data.length - 1 ? 'stop' : null };
      }
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      throw new AIProviderError(error instanceof Error ? error.message : String(error), 'gemini');
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
    const contents = request.messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: [{ text: m.content }],
    }));
    const systemMessages = request.messages.filter(m => m.role === 'system');
    const body: Record<string, unknown> = { contents };
    if (systemMessages.length > 0) body.system_instruction = { parts: systemMessages.map(m => ({ text: m.content })) };
    const generationConfig: Record<string, unknown> = {};
    if (request.temperature !== undefined) generationConfig.temperature = request.temperature;
    if (request.maxTokens !== undefined) generationConfig.max_output_tokens = request.maxTokens;
    if (request.topP !== undefined) generationConfig.top_p = request.topP;
    if (request.stop !== undefined) generationConfig.stop_sequences = request.stop;
    if (Object.keys(generationConfig).length > 0) body.generation_config = generationConfig;
    if (request.tools) body.tools = request.tools.map(t => ({ function_declarations: [t.function] }));
    return body;
  }

  private parseResponse(data: Record<string, unknown>, request: AIRequest, startTime: number): AIResponse {
    const candidate = (data.candidates as Array<Record<string, unknown>>)?.[0];
    const content = candidate?.content as Record<string, unknown> | undefined;
    const parts = content?.parts as Array<Record<string, unknown>> | undefined;
    const text = parts?.map(p => p.text as string).join('') ?? '';
    const usage = data.usageMetadata as Record<string, unknown> | undefined;
    const inputTokens = (usage?.promptTokenCount as number) ?? 0;
    const outputTokens = (usage?.candidatesTokenCount as number) ?? 0;
    const pricing = this.models.get(request.model)?.pricing;
    const estimatedCostUsd = pricing ? (inputTokens / 1000) * pricing.inputPer1K + (outputTokens / 1000) * pricing.outputPer1K : undefined;
    return {
      id: uuid(),
      model: request.model,
      provider: 'gemini',
      messages: [{ role: 'assistant', content: text }],
      tokenUsage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens, estimatedCostUsd },
      finishReason: 'stop',
      latencyMs: Date.now() - startTime,
    };
  }

  private buildMockResponse(request: AIRequest, startTime: number): AIResponse {
    this.logger.warn('Gemini provider called without API key — returning mock response');
    const inputTokens = request.messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
    return {
      id: uuid(),
      model: request.model,
      provider: 'gemini',
      messages: [{ role: 'assistant', content: `[Mock Gemini response for ${request.model}]` }],
      tokenUsage: { inputTokens, outputTokens: 10, totalTokens: inputTokens + 10, estimatedCostUsd: 0 },
      finishReason: 'stop',
      latencyMs: Date.now() - startTime,
    };
  }

  private async *mockStream(request: AIRequest, startTime: number): AsyncGenerator<AIStreamChunk> {
    yield { index: 0, delta: `[Mock Gemini stream for ${request.model}]`, finishReason: 'stop' };
  }
}
