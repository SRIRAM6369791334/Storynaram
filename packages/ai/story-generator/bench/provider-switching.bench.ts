import { bench, describe } from 'vitest';
import { ModelSelector } from '../src/selection/model-selector';
import { ProviderSelector } from '../src/selection/provider-selector';

describe('Provider Switching Benchmarks', () => {
  const modelSelector = new ModelSelector();
  const providerSelector = new ProviderSelector();

  bench('select model with streaming requirements', () => {
    modelSelector.select({ requiresStreaming: true });
  });

  bench('select model with all requirements', () => {
    modelSelector.select({ requiresStreaming: true, requiresJson: true, minTokens: 32000 });
  });

  bench('select provider fallback', () => {
    providerSelector.selectFallback('gpt-4', 'openai');
  });

  bench('register 100 custom models', () => {
    const selector = new ModelSelector();
    for (let i = 0; i < 100; i++) {
      selector.registerModel(`custom-${i}`, {
        maxTokens: 100000, supportsStreaming: true, supportsTools: true, supportsJson: true,
        supportsFunctionCalling: true, costPer1kInput: 0.01, costPer1kOutput: 0.02,
      });
    }
  });
});
