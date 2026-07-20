import { Injectable, Logger } from '@nestjs/common';
import type { AIFallbackConfig, AIRequest, AIResponse, AIProviderName } from './types';
import { AIFallbackExhaustedError } from './errors';
import type { AIProvider } from './providers/ai-provider.interface';
import { AIProviderRegistry } from './ai-provider-registry.service';

export interface FallbackResult {
  response: AIResponse;
  usedProvider: AIProviderName;
  usedModel: string;
  attemptedProviders: AIProviderName[];
  attemptedModels: string[];
}

@Injectable()
export class AIFallbackPolicy {
  private readonly logger = new Logger(AIFallbackPolicy.name);

  constructor(private readonly providerRegistry: AIProviderRegistry) {}

  async executeWithFallback(
    request: AIRequest,
    config: AIFallbackConfig,
    onFallback?: (from: AIProviderName, to: AIProviderName, reason: string) => void,
  ): Promise<FallbackResult> {
    const attemptedProviders: AIProviderName[] = [];
    const attemptedModels: string[] = [];
    const startTime = Date.now();

    for (const providerName of config.providers) {
      for (const model of config.models) {
        try {
          const provider = this.providerRegistry.resolve(providerName);
          const fallbackRequest: AIRequest = { ...request, provider: providerName, model };

          const response = config.timeoutMs
            ? await this.executeWithTimeout(provider, fallbackRequest, config.timeoutMs)
            : await provider.generate(fallbackRequest);

          if (attemptedProviders.length > 0 || attemptedModels.length > 0) {
            onFallback?.(
              attemptedProviders[attemptedProviders.length - 1] ?? providerName,
              providerName,
              `Fallback from ${attemptedProviders.join(',')}/${attemptedModels.join(',')}`,
            );
          }

          return {
            response,
            usedProvider: providerName,
            usedModel: model,
            attemptedProviders,
            attemptedModels,
          };
        } catch (error) {
          this.logger.warn(`Fallback attempt failed: ${providerName}/${model}: ${error instanceof Error ? error.message : String(error)}`);
          attemptedProviders.push(providerName);
          attemptedModels.push(model);
        }
      }
    }

    throw new AIFallbackExhaustedError(attemptedProviders, attemptedModels);
  }

  private async executeWithTimeout(
    provider: AIProvider,
    request: AIRequest,
    timeoutMs: number,
  ): Promise<AIResponse> {
    const result = await Promise.race([
      provider.generate(request),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Provider ${provider.name} timed out after ${timeoutMs}ms`)), timeoutMs),
      ),
    ]);
    return result;
  }
}
