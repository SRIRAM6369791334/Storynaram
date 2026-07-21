export interface ProviderConfig {
  name: string;
  priority: number;
  models: string[];
  baseUrl?: string;
  apiKeyEnv?: string;
}

export class ProviderSelector {
  private providers: ProviderConfig[] = [];

  constructor() {
    this.registerDefaultProviders();
  }

  private registerDefaultProviders(): void {
    this.registerProvider({ name: 'openai', priority: 1, models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'], apiKeyEnv: 'OPENAI_API_KEY' });
    this.registerProvider({ name: 'anthropic', priority: 2, models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'], apiKeyEnv: 'ANTHROPIC_API_KEY' });
    this.registerProvider({ name: 'gemini', priority: 3, models: ['gemini-pro'], apiKeyEnv: 'GEMINI_API_KEY' });
    this.registerProvider({ name: 'ollama', priority: 4, models: ['llama3', 'mistral'], baseUrl: 'http://localhost:11434' });
    this.registerProvider({ name: 'azure-openai', priority: 5, models: ['gpt-4', 'gpt-4-turbo'], apiKeyEnv: 'AZURE_OPENAI_API_KEY' });
    this.registerProvider({ name: 'openrouter', priority: 6, models: ['gpt-4', 'claude-3-opus', 'gemini-pro'], apiKeyEnv: 'OPENROUTER_API_KEY' });
    this.registerProvider({ name: 'mock', priority: 99, models: ['mock-model'] });
  }

  registerProvider(config: ProviderConfig): void {
    this.providers.push(config);
    this.providers.sort((a, b) => a.priority - b.priority);
  }

  selectProvider(model: string, preferProvider?: string): ProviderConfig {
    if (preferProvider) {
      const preferred = this.providers.find(p => p.name === preferProvider && p.models.includes(model));
      if (preferred) return preferred;
    }

    const provider = this.providers.find(p => p.models.includes(model));
    if (provider) return provider;

    const defaultProvider = this.providers.find(p => p.name === 'openai')!;
    if (defaultProvider) {
      return { ...defaultProvider, models: [...defaultProvider.models, model] };
    }

    return this.providers[0] ?? { name: 'mock', priority: 99, models: ['mock-model'] };
  }

  selectFallback(failedModel: string, failedProvider: string, options?: { exclude?: string[] }): { model: string; provider: ProviderConfig } | null {
    const failedProviderConfig = this.providers.find(p => p.name === failedProvider);
    const exclude = options?.exclude ?? [failedProvider];

    const fallbacks: Array<{ model: string; provider: ProviderConfig }> = [];

    for (const p of this.providers) {
      if (exclude.includes(p.name)) continue;
      for (const m of p.models) {
        if (m === failedModel) continue;
        fallbacks.push({ model: m, provider: p });
      }
    }

    fallbacks.sort((a, b) => a.provider.priority - b.provider.priority);

    return fallbacks[0] ?? null;
  }

  getProvider(name: string): ProviderConfig | undefined {
    return this.providers.find(p => p.name === name);
  }

  listProviders(): string[] {
    return this.providers.map(p => p.name);
  }

  listModelsForProvider(providerName: string): string[] {
    const provider = this.providers.find(p => p.name === providerName);
    return provider?.models ?? [];
  }
}
