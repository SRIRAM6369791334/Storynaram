import { describe, it, expect } from 'vitest';
import { ModelSelector } from '../src/selection/model-selector';

describe('ModelSelector', () => {
  it('selects a model by preference', () => {
    const selector = new ModelSelector();
    const selection = selector.select({ preferredModel: 'gpt-4o' });

    expect(selection.model).toBe('gpt-4o');
    expect(selection.provider).toBe('openai');
    expect(selection.capability.maxTokens).toBeGreaterThan(0);
  });

  it('selects model with streaming support', () => {
    const selector = new ModelSelector();
    const selection = selector.select({ requiresStreaming: true });

    expect(selection.capability.supportsStreaming).toBe(true);
  });

  it('selects model with JSON support', () => {
    const selector = new ModelSelector();
    const selection = selector.select({ requiresJson: true });

    expect(selection.capability.supportsJson).toBe(true);
  });

  it('falls back to cheapest model when requirements cannot be met', () => {
    const selector = new ModelSelector();
    const selection = selector.select({ minTokens: 500000 });

    expect(selection).toBeDefined();
    expect(selection.model).toBeDefined();
  });

  it('selects for story generation', () => {
    const selector = new ModelSelector();
    const selection = selector.selectForStoryGeneration();

    expect(selection.capability.supportsStreaming).toBe(true);
    expect(selection.capability.maxTokens).toBeGreaterThanOrEqual(32000);
  });

  it('selects for quick generation', () => {
    const selector = new ModelSelector();
    const selection = selector.selectForQuickGeneration();

    expect(selection).toBeDefined();
  });

  it('returns capability for known model', () => {
    const selector = new ModelSelector();
    const capability = selector.getCapability('gpt-4o');

    expect(capability).toBeDefined();
    expect(capability!.maxTokens).toBe(128000);
    expect(capability!.supportsStreaming).toBe(true);
  });

  it('returns undefined for unknown model', () => {
    const selector = new ModelSelector();
    const capability = selector.getCapability('unknown-model');

    expect(capability).toBeUndefined();
  });

  it('lists all registered models', () => {
    const selector = new ModelSelector();
    const models = selector.listModels();

    expect(models).toContain('gpt-4o');
    expect(models).toContain('claude-sonnet-4-20250514');
    expect(models).toContain('gemini-2.5-pro');
  });

  it('allows registering custom models', () => {
    const selector = new ModelSelector();
    selector.registerModel('custom-model', {
      maxTokens: 100000, supportsStreaming: true, supportsTools: true, supportsJson: true, supportsFunctionCalling: true, costPer1kInput: 0.01, costPer1kOutput: 0.02,
    });

    const capability = selector.getCapability('custom-model');
    expect(capability).toBeDefined();
    expect(capability!.maxTokens).toBe(100000);
  });
});
