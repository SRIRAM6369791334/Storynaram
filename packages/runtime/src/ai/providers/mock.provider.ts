import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { AIRequest, AIResponse, AIStreamChunk, AIProviderCapabilities, AIProviderHealth, AIModelMetadata, AIProviderName } from '../types';
import { AIProvider } from './ai-provider.interface';

export interface MockProviderConfig {
  defaultModel?: string;
  simulateLatencyMs?: number;
  failureRate?: number;
}

@Injectable()
export class MockProvider extends AIProvider {
  readonly name: AIProviderName = 'mock';
  readonly displayName = 'Mock Provider';
  readonly capabilities: AIProviderCapabilities = {
    streaming: true,
    toolUse: true,
    vision: true,
    functionCalling: true,
    embedding: true,
    jsonMode: true,
    maxConcurrent: 100,
  };

  private readonly models: Map<string, AIModelMetadata> = new Map();
  private readonly config: Required<MockProviderConfig>;
  private callHistory: Array<{ request: AIRequest; timestamp: Date }> = [];

  constructor(config?: MockProviderConfig) {
    super();
    this.config = {
      defaultModel: config?.defaultModel ?? 'mock-model',
      simulateLatencyMs: config?.simulateLatencyMs ?? 0,
      failureRate: config?.failureRate ?? 0,
    };
    this.registerDefaultModels();
  }

  private registerDefaultModels(): void {
    const models: AIModelMetadata[] = [
      {
        id: 'mock-model',
        provider: 'mock',
        displayName: 'Mock Model',
        contextWindow: 128000,
        maxOutputTokens: 4096,
        capabilities: { vision: true, toolUse: true, streaming: true, functionCalling: true, jsonMode: true, embedding: true },
        pricing: { inputPer1K: 0, outputPer1K: 0, currency: 'USD' },
      },
      {
        id: 'mock-small',
        provider: 'mock',
        displayName: 'Mock Small',
        contextWindow: 32000,
        maxOutputTokens: 2048,
        capabilities: { vision: false, toolUse: false, streaming: true, functionCalling: false, jsonMode: true, embedding: false },
        pricing: { inputPer1K: 0, outputPer1K: 0, currency: 'USD' },
      },
    ];
    for (const model of models) {
      this.models.set(model.id, model);
    }
  }

  getCallHistory(): Array<{ request: AIRequest; timestamp: Date }> {
    return this.callHistory;
  }

  clearCallHistory(): void {
    this.callHistory = [];
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    await this.simulateLatency();
    this.callHistory.push({ request, timestamp: new Date() });

    if (Math.random() < this.config.failureRate) {
      throw new Error('Mock provider simulated failure');
    }

    const modelId = request.model;
    const model = this.models.get(modelId);
    const lastUserMessage = [...request.messages].reverse().find(m => m.role === 'user');
    const content = lastUserMessage?.content ?? 'Mock response';
    const inputTokens = this.estimateTokens(request.messages.map(m => ({ role: m.role, content: m.content })));
    const outputTokens = this.estimateTokens([{ role: 'assistant', content }]);

    return {
      id: uuid(),
      model: modelId,
      provider: 'mock',
      messages: [{ role: 'assistant', content, toolCalls: this.shouldReturnToolCalls(request) ? this.createMockToolCalls(request) : undefined }],
      tokenUsage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens, estimatedCostUsd: 0 },
      finishReason: 'stop',
      latencyMs: this.config.simulateLatencyMs,
      metadata: { mock: true },
    };
  }

  async *generateStream(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    await this.simulateLatency();
    this.callHistory.push({ request, timestamp: new Date() });

    if (Math.random() < this.config.failureRate) {
      throw new Error('Mock provider simulated failure');
    }

    const lastUserMessage = [...request.messages].reverse().find(m => m.role === 'user');
    const content = lastUserMessage?.content ?? 'Mock response';
    const words = content.split(' ');
    const totalChars = content.length;

    for (let i = 0; i < words.length; i++) {
      const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
      yield {
        index: i,
        delta: chunk,
        finishReason: i === words.length - 1 ? 'stop' : null,
        tokenUsage: i === words.length - 1
          ? { inputTokens: this.estimateTokens(request.messages.map(m => ({ role: m.role, content: m.content }))), outputTokens: this.estimateTokens([{ role: 'assistant', content }]), totalTokens: 0 }
          : undefined,
      };
    }
  }

  async countTokens(messages: { role: string; content: string }[]): Promise<number> {
    return this.estimateTokens(messages);
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

  private async simulateLatency(): Promise<void> {
    if (this.config.simulateLatencyMs > 0) {
      await new Promise(resolve => setTimeout(resolve, this.config.simulateLatencyMs));
    }
  }

  private estimateTokens(messages: { role: string; content: string }[]): number {
    return messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
  }

  private shouldReturnToolCalls(request: AIRequest): boolean {
    return !!(request.tools && request.tools.length > 0 && request.toolChoice !== 'none');
  }

  private createMockToolCalls(request: AIRequest): Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }> {
    if (!request.tools) return [];
    const firstTool = request.tools[0];
    if (!firstTool) return [];
    return [{
      id: `call_${uuid().slice(0, 8)}`,
      type: 'function',
      function: {
        name: firstTool.function.name,
        arguments: JSON.stringify({ mock: true }),
      },
    }];
  }
}
