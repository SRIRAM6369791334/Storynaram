import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { AIRequest, AIResponse, AIStreamChunk, AIProviderCapabilities, AIProviderHealth, AIModelMetadata, AIProviderName } from '../types.js';
import { AIProvider } from './ai-provider.interface.js';
import { AIProviderError } from '../errors.js';
import type { AIProviderConfig } from '../types.js';

export interface CustomProviderConfig extends AIProviderConfig {
  generateHandler?: (request: AIRequest) => Promise<AIResponse>;
  streamHandler?: (request: AIRequest) => AsyncGenerator<AIStreamChunk>;
  models?: AIModelMetadata[];
}

@Injectable()
export class CustomProvider extends AIProvider {
  readonly name: AIProviderName = 'custom';
  readonly displayName: string;
  readonly capabilities: AIProviderCapabilities;

  private readonly logger = new Logger(CustomProvider.name);
  private readonly config: CustomProviderConfig;
  private readonly models: Map<string, AIModelMetadata> = new Map();

  constructor(config: CustomProviderConfig) {
    super();
    this.config = config;
    this.displayName = config.displayName;
    this.capabilities = {
      streaming: !!(config.streamHandler || config.apiKey),
      toolUse: true,
      vision: config.capabilities?.vision ?? true,
      functionCalling: config.capabilities?.functionCalling ?? true,
      embedding: config.capabilities?.embedding ?? false,
      jsonMode: config.capabilities?.jsonMode ?? true,
      maxConcurrent: config.capabilities?.maxConcurrent ?? 10,
    };
    if (config.models) {
      for (const model of config.models) {
        this.models.set(model.id, model);
      }
    }
    this.registerDefaultModels();
  }

  private registerDefaultModels(): void {
    if (this.models.size === 0) {
      const defaultModel: AIModelMetadata = {
        id: 'default',
        provider: 'custom',
        displayName: `${this.displayName} Default`,
        contextWindow: 128000,
        maxOutputTokens: 4096,
        capabilities: { vision: false, toolUse: false, streaming: this.capabilities.streaming, functionCalling: false, jsonMode: true, embedding: false },
        pricing: { inputPer1K: 0, outputPer1K: 0, currency: 'USD' },
      };
      this.models.set(defaultModel.id, defaultModel);
    }
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    if (this.config.generateHandler) {
      return this.config.generateHandler(request);
    }
    if (!this.config.apiKey) return this.buildMockResponse(request);
    try {
      const response = await fetch(this.config.baseUrl ?? 'https://api.custom-ai.example.com/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages.map(m => ({ role: m.role, content: m.content })),
          temperature: request.temperature,
          max_tokens: request.maxTokens,
        }),
        signal: AbortSignal.timeout(60000),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new AIProviderError(`Custom provider error ${response.status}: ${body}`, 'custom', response.status);
      }
      const data = await response.json() as Record<string, unknown>;
      return {
        id: uuid(),
        model: request.model,
        provider: 'custom',
        messages: [{ role: 'assistant', content: (data.content as string) ?? (data.text as string) ?? '' }],
        tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        finishReason: 'stop',
        latencyMs: 0,
      };
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      throw new AIProviderError(error instanceof Error ? error.message : String(error), 'custom');
    }
  }

  async *generateStream(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    if (this.config.streamHandler) {
      yield* this.config.streamHandler(request);
      return;
    }
    yield { index: 0, delta: `[Custom provider ${this.displayName} stream response]`, finishReason: 'stop' };
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
    return { ok: true, latencyMs: 0, lastChecked: new Date() };
  }

  private buildMockResponse(request: AIRequest): AIResponse {
    this.logger.warn(`Custom provider "${this.displayName}" called without handler or API key — returning mock response`);
    return {
      id: uuid(),
      model: request.model,
      provider: 'custom',
      messages: [{ role: 'assistant', content: `[Mock ${this.displayName} response for ${request.model}]` }],
      tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCostUsd: 0 },
      finishReason: 'stop',
      latencyMs: 0,
    };
  }
}
