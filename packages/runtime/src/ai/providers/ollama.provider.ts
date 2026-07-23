import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { AIRequest, AIResponse, AIStreamChunk, AIProviderCapabilities, AIProviderHealth, AIModelMetadata, AIProviderName } from '../types.js';
import { AIProvider } from './ai-provider.interface.js';
import { AIProviderError } from '../errors.js';
import type { AIProviderConfig } from '../types.js';

@Injectable()
export class OllamaProvider extends AIProvider {
  readonly name: AIProviderName = 'ollama';
  readonly displayName = 'Ollama';
  readonly capabilities: AIProviderCapabilities = {
    streaming: true,
    toolUse: true,
    vision: true,
    functionCalling: true,
    embedding: false,
    jsonMode: true,
    maxConcurrent: 10,
  };

  private readonly logger = new Logger(OllamaProvider.name);
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
        id: 'llama3.2',
        provider: 'ollama',
        displayName: 'Llama 3.2',
        contextWindow: 128000,
        maxOutputTokens: 4096,
        capabilities: { vision: false, toolUse: false, streaming: true, functionCalling: false, jsonMode: false, embedding: false },
        pricing: { inputPer1K: 0, outputPer1K: 0, currency: 'USD' },
      },
      {
        id: 'mistral',
        provider: 'ollama',
        displayName: 'Mistral',
        contextWindow: 32000,
        maxOutputTokens: 4096,
        capabilities: { vision: false, toolUse: false, streaming: true, functionCalling: false, jsonMode: false, embedding: false },
        pricing: { inputPer1K: 0, outputPer1K: 0, currency: 'USD' },
      },
    ];
    for (const model of models) {
      this.models.set(model.id, model);
    }
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    try {
      const baseUrl = this.config.baseUrl ?? 'http://localhost:11434';
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages.map(m => ({ role: m.role, content: m.content })),
          stream: false,
          options: {
            ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
            ...(request.maxTokens !== undefined ? { num_predict: request.maxTokens } : {}),
            ...(request.topP !== undefined ? { top_p: request.topP } : {}),
            ...(request.stop !== undefined ? { stop: request.stop } : {}),
          },
        }),
        signal: AbortSignal.timeout(120000),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new AIProviderError(`Ollama API error ${response.status}: ${body}`, 'ollama', response.status);
      }
      const data = await response.json() as Record<string, unknown>;
      const message = data.message as Record<string, unknown> | undefined;
      const content = message?.content as string ?? '';
      const inputTokens = request.messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
      const outputTokens = Math.ceil(content.length / 4);
      return {
        id: uuid(),
        model: request.model,
        provider: 'ollama',
        messages: [{ role: 'assistant', content }],
        tokenUsage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens, estimatedCostUsd: 0 },
        finishReason: 'stop',
        latencyMs: Date.now() - startTime,
      };
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      throw new AIProviderError(error instanceof Error ? error.message : String(error), 'ollama');
    }
  }

  async *generateStream(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    try {
      const baseUrl = this.config.baseUrl ?? 'http://localhost:11434';
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages.map(m => ({ role: m.role, content: m.content })),
          stream: true,
        }),
        signal: AbortSignal.timeout(120000),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new AIProviderError(`Ollama API error ${response.status}: ${body}`, 'ollama', response.status);
      }
      const reader = response.body?.getReader();
      if (!reader) throw new AIProviderError('No response body', 'ollama');
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
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line) as Record<string, unknown>;
            const message = parsed.message as Record<string, unknown> | undefined;
            const content = message?.content as string ?? '';
            const done = parsed.done as boolean;
            yield { index: index++, delta: content, finishReason: done ? 'stop' : null };
          } catch { /* skip */ }
        }
      }
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      throw new AIProviderError(error instanceof Error ? error.message : String(error), 'ollama');
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
      const baseUrl = this.config.baseUrl ?? 'http://localhost:11434';
      const response = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });
      return { ok: response.ok, latencyMs: Date.now() - start, lastChecked: new Date(), error: response.ok ? undefined : `HTTP ${response.status}` };
    } catch { return { ok: false, latencyMs: Date.now() - start, lastChecked: new Date(), error: 'Connection failed' }; }
  }
}
