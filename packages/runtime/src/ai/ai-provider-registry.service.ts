import { Injectable, Logger } from '@nestjs/common';
import { AIProvider } from './providers/ai-provider.interface.js';
import { MockProvider } from './providers/mock.provider.js';
import { OpenAIProvider } from './providers/openai.provider.js';
import { AnthropicProvider } from './providers/anthropic.provider.js';
import { GeminiProvider } from './providers/gemini.provider.js';
import { OllamaProvider } from './providers/ollama.provider.js';
import { OpenRouterProvider } from './providers/openrouter.provider.js';
import { AzureProvider } from './providers/azure.provider.js';
import { CustomProvider } from './providers/custom.provider.js';
import type { AIProviderName, AIProviderConfig, AIProviderCapabilities, AIProviderHealth } from './types.js';
import { AIProviderError } from './errors.js';

@Injectable()
export class AIProviderRegistry {
  private readonly logger = new Logger(AIProviderRegistry.name);
  private readonly providers: Map<AIProviderName, AIProvider> = new Map();

  register(provider: AIProvider): void {
    this.providers.set(provider.name, provider);
    this.logger.log(`Registered AI provider: ${provider.displayName} (${provider.name})`);
  }

  unregister(name: AIProviderName): void {
    this.providers.delete(name);
    this.logger.log(`Unregistered AI provider: ${name}`);
  }

  resolve(name: AIProviderName): AIProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new AIProviderError(`AI provider "${name}" is not registered`, name);
    }
    return provider;
  }

  get(name: AIProviderName): AIProvider | undefined {
    return this.providers.get(name);
  }

  list(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  listNames(): AIProviderName[] {
    return Array.from(this.providers.keys());
  }

  has(name: AIProviderName): boolean {
    return this.providers.has(name);
  }

  async health(): Promise<Record<AIProviderName, AIProviderHealth>> {
    const result: Record<string, AIProviderHealth> = {};
    for (const [name, provider] of this.providers) {
      try {
        result[name] = await provider.health();
      } catch {
        result[name] = { ok: false, latencyMs: 0, lastChecked: new Date(), error: 'Health check failed' };
      }
    }
    return result;
  }

  createProvider(config: AIProviderConfig): AIProvider {
    switch (config.name) {
      case 'mock':
        return new MockProvider(config.metadata as Record<string, unknown> as never);
      case 'openai':
        return new OpenAIProvider(config);
      case 'anthropic':
        return new AnthropicProvider(config);
      case 'gemini':
        return new GeminiProvider(config);
      case 'ollama':
        return new OllamaProvider(config);
      case 'openrouter':
        return new OpenRouterProvider(config);
      case 'azure':
        return new AzureProvider(config);
      case 'custom':
        return new CustomProvider(config);
      default:
        throw new AIProviderError(`Unknown provider type: ${config.name}`, config.name);
    }
  }
}
