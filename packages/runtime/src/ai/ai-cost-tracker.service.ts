import { Injectable } from '@nestjs/common';
import type { AITokenUsage, AIProviderName, AIModelPricing } from './types.js';

interface CostEntry {
  provider: AIProviderName;
  model: string;
  tokenUsage: AITokenUsage;
  costUsd: number;
  timestamp: Date;
}

@Injectable()
export class AICostTracker {
  private readonly entries: CostEntry[] = [];
  private readonly pricingOverrides: Map<string, AIModelPricing> = new Map();
  private readonly defaultPricing: Record<AIProviderName, AIModelPricing> = {
    openai: { inputPer1K: 0.0025, outputPer1K: 0.01, currency: 'USD' },
    anthropic: { inputPer1K: 0.003, outputPer1K: 0.015, currency: 'USD' },
    gemini: { inputPer1K: 0.00125, outputPer1K: 0.01, currency: 'USD' },
    ollama: { inputPer1K: 0, outputPer1K: 0, currency: 'USD' },
    openrouter: { inputPer1K: 0.0025, outputPer1K: 0.01, currency: 'USD' },
    azure: { inputPer1K: 0.0025, outputPer1K: 0.01, currency: 'USD' },
    custom: { inputPer1K: 0, outputPer1K: 0, currency: 'USD' },
    mock: { inputPer1K: 0, outputPer1K: 0, currency: 'USD' },
  };

  setPricing(provider: AIProviderName, model: string, pricing: AIModelPricing): void {
    this.pricingOverrides.set(`${provider}:${model}`, pricing);
  }

  track(provider: AIProviderName, model: string, tokenUsage: AITokenUsage): number {
    const pricing = this.pricingOverrides.get(`${provider}:${model}`) ?? this.defaultPricing[provider] ?? this.defaultPricing.mock;
    const costUsd = (tokenUsage.inputTokens / 1000) * pricing.inputPer1K + (tokenUsage.outputTokens / 1000) * pricing.outputPer1K;

    this.entries.push({
      provider,
      model,
      tokenUsage,
      costUsd,
      timestamp: new Date(),
    });

    return costUsd;
  }

  estimateCost(provider: AIProviderName, model: string, inputTokens: number, outputTokens: number): number {
    const pricing = this.pricingOverrides.get(`${provider}:${model}`) ?? this.defaultPricing[provider] ?? this.defaultPricing.mock;
    return (inputTokens / 1000) * pricing.inputPer1K + (outputTokens / 1000) * pricing.outputPer1K;
  }

  getTotalCost(): number {
    return this.entries.reduce((sum, e) => sum + e.costUsd, 0);
  }

  getCostByProvider(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const entry of this.entries) {
      result[entry.provider] = (result[entry.provider] ?? 0) + entry.costUsd;
    }
    return result;
  }

  getCostByModel(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const entry of this.entries) {
      result[entry.model] = (result[entry.model] ?? 0) + entry.costUsd;
    }
    return result;
  }

  getTotalTokens(): AITokenUsage {
    return this.entries.reduce(
      (sum, e) => ({
        inputTokens: sum.inputTokens + e.tokenUsage.inputTokens,
        outputTokens: sum.outputTokens + e.tokenUsage.outputTokens,
        totalTokens: sum.totalTokens + e.tokenUsage.totalTokens,
        estimatedCostUsd: (sum.estimatedCostUsd ?? 0) + e.costUsd,
      }),
      { inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCostUsd: 0 },
    );
  }

  getRecentEntries(count: number = 10): CostEntry[] {
    return this.entries.slice(-count);
  }

  clear(): void {
    this.entries.length = 0;
  }

  get entryCount(): number {
    return this.entries.length;
  }
}
