import type { AIRequest, AIResponse, AIStreamChunk, AIProviderCapabilities, AIProviderHealth, AIModelMetadata, AIProviderName } from '../types';

export abstract class AIProvider {
  abstract readonly name: AIProviderName;
  abstract readonly displayName: string;
  abstract readonly capabilities: AIProviderCapabilities;

  abstract generate(request: AIRequest): Promise<AIResponse>;
  abstract generateStream(request: AIRequest): AsyncGenerator<AIStreamChunk>;
  abstract countTokens(messages: { role: string; content: string }[]): Promise<number>;
  abstract getModel(modelId: string): AIModelMetadata | undefined;
  abstract listModels(): AIModelMetadata[];
  abstract health(): Promise<AIProviderHealth>;
}
