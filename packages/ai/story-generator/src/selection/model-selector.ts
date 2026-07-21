export interface ModelCapability {
  maxTokens: number;
  supportsStreaming: boolean;
  supportsTools: boolean;
  supportsJson: boolean;
  supportsFunctionCalling: boolean;
  costPer1kInput: number;
  costPer1kOutput: number;
}

export interface ModelSelection {
  model: string;
  provider: string;
  capability: ModelCapability;
}

export class ModelSelector {
  private readonly models: Map<string, ModelCapability> = new Map();

  constructor() {
    this.registerDefaultModels();
  }

  private registerDefaultModels(): void {
    this.registerModel('gpt-4', {
      maxTokens: 8192, supportsStreaming: true, supportsTools: true, supportsJson: true, supportsFunctionCalling: true, costPer1kInput: 0.03, costPer1kOutput: 0.06,
    });
    this.registerModel('gpt-4-turbo', {
      maxTokens: 128000, supportsStreaming: true, supportsTools: true, supportsJson: true, supportsFunctionCalling: true, costPer1kInput: 0.01, costPer1kOutput: 0.03,
    });
    this.registerModel('gpt-3.5-turbo', {
      maxTokens: 16384, supportsStreaming: true, supportsTools: true, supportsJson: true, supportsFunctionCalling: true, costPer1kInput: 0.0015, costPer1kOutput: 0.002,
    });
    this.registerModel('claude-3-opus', {
      maxTokens: 200000, supportsStreaming: true, supportsTools: true, supportsJson: false, supportsFunctionCalling: true, costPer1kInput: 0.015, costPer1kOutput: 0.075,
    });
    this.registerModel('claude-3-sonnet', {
      maxTokens: 200000, supportsStreaming: true, supportsTools: true, supportsJson: false, supportsFunctionCalling: true, costPer1kInput: 0.003, costPer1kOutput: 0.015,
    });
    this.registerModel('claude-3-haiku', {
      maxTokens: 200000, supportsStreaming: true, supportsTools: true, supportsJson: false, supportsFunctionCalling: true, costPer1kInput: 0.00025, costPer1kOutput: 0.00125,
    });
    this.registerModel('gemini-pro', {
      maxTokens: 30720, supportsStreaming: true, supportsTools: true, supportsJson: true, supportsFunctionCalling: false, costPer1kInput: 0.00025, costPer1kOutput: 0.0005,
    });
    this.registerModel('mistral-large', {
      maxTokens: 32768, supportsStreaming: true, supportsTools: true, supportsJson: true, supportsFunctionCalling: true, costPer1kInput: 0.002, costPer1kOutput: 0.006,
    });
  }

  registerModel(name: string, capability: ModelCapability): void {
    this.models.set(name, capability);
  }

  select(options: { preferredModel?: string; requiresStreaming?: boolean; requiresTools?: boolean; requiresJson?: boolean; minTokens?: number; maxCost?: number }): ModelSelection {
    let candidates = Array.from(this.models.entries()).map(([model, cap]) => ({ model, provider: this.modelToProvider(model), capability: cap }));

    if (options.preferredModel) {
      const preferred = candidates.find(c => c.model === options.preferredModel);
      if (preferred && this.matchesRequirements(preferred.capability, options)) {
        return preferred;
      }
    }

    if (options.requiresStreaming) {
      candidates = candidates.filter(c => c.capability.supportsStreaming);
    }
    if (options.requiresTools) {
      candidates = candidates.filter(c => c.capability.supportsTools);
    }
    if (options.requiresJson) {
      candidates = candidates.filter(c => c.capability.supportsJson);
    }
    if (options.minTokens) {
      candidates = candidates.filter(c => c.capability.maxTokens >= options.minTokens!);
    }

    if (candidates.length === 0) {
      const fallback = Array.from(this.models.entries())[0]!;
      return { model: fallback[0], provider: this.modelToProvider(fallback[0]), capability: fallback[1] };
    }

    candidates.sort((a, b) => a.capability.costPer1kInput - b.capability.costPer1kInput);
    return candidates[0]!;
  }

  selectForStoryGeneration(preferredModel?: string): ModelSelection {
    return this.select({
      preferredModel,
      requiresStreaming: true,
      minTokens: 32000,
      maxCost: 0.05,
    });
  }

  selectForQuickGeneration(preferredModel?: string): ModelSelection {
    return this.select({
      preferredModel,
      requiresStreaming: true,
      minTokens: 16000,
      maxCost: 0.02,
    });
  }

  getCapability(model: string): ModelCapability | undefined {
    return this.models.get(model);
  }

  listModels(): string[] {
    return Array.from(this.models.keys());
  }

  private matchesRequirements(capability: ModelCapability, options: { requiresStreaming?: boolean; requiresTools?: boolean; requiresJson?: boolean; minTokens?: number }): boolean {
    if (options.requiresStreaming && !capability.supportsStreaming) return false;
    if (options.requiresTools && !capability.supportsTools) return false;
    if (options.requiresJson && !capability.supportsJson) return false;
    if (options.minTokens && capability.maxTokens < options.minTokens) return false;
    return true;
  }

  private modelToProvider(model: string): string {
    if (model.startsWith('gpt')) return 'openai';
    if (model.startsWith('claude')) return 'anthropic';
    if (model.startsWith('gemini')) return 'gemini';
    if (model.startsWith('mistral')) return 'mistral';
    return 'openai';
  }
}
