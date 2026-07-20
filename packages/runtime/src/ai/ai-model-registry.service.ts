import { Injectable, Logger } from '@nestjs/common';
import type { AIModelMetadata, AIProviderName } from './types';
import { AIModelError } from './errors';

@Injectable()
export class AIModelRegistry {
  private readonly logger = new Logger(AIModelRegistry.name);
  private readonly models: Map<string, AIModelMetadata> = new Map();
  private defaultModelId: string | null = null;

  register(model: AIModelMetadata): void {
    this.models.set(model.id, model);
    this.logger.log(`Registered AI model: ${model.displayName} (${model.id})`);
  }

  registerMany(models: AIModelMetadata[]): void {
    for (const model of models) {
      this.register(model);
    }
  }

  unregister(modelId: string): void {
    this.models.delete(modelId);
    if (this.defaultModelId === modelId) {
      this.defaultModelId = null;
    }
  }

  resolve(modelId: string): AIModelMetadata {
    const model = this.models.get(modelId);
    if (!model) {
      throw new AIModelError(`Model "${modelId}" is not registered`, 'unknown', modelId);
    }
    return model;
  }

  get(modelId: string): AIModelMetadata | undefined {
    return this.models.get(modelId);
  }

  list(): AIModelMetadata[] {
    return Array.from(this.models.values());
  }

  listByProvider(provider: AIProviderName): AIModelMetadata[] {
    return Array.from(this.models.values()).filter(m => m.provider === provider);
  }

  listByCapability(capability: keyof AIModelMetadata['capabilities']): AIModelMetadata[] {
    return Array.from(this.models.values()).filter(m => m.capabilities[capability]);
  }

  setDefault(modelId: string): void {
    if (!this.models.has(modelId)) {
      throw new AIModelError(`Cannot set default: model "${modelId}" is not registered`, 'unknown', modelId);
    }
    this.defaultModelId = modelId;
  }

  getDefault(): AIModelMetadata | undefined {
    if (this.defaultModelId) {
      return this.models.get(this.defaultModelId);
    }
    return this.list()[0];
  }

  clear(): void {
    this.models.clear();
    this.defaultModelId = null;
  }

  get size(): number {
    return this.models.size;
  }
}
