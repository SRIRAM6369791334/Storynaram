import { describe, it, expect } from 'vitest';
import { ProviderSelector } from '../src/selection/provider-selector';

describe('ProviderSelector', () => {
  it('selects provider for a model', () => {
    const selector = new ProviderSelector();
    const provider = selector.selectProvider('gpt-4');

    expect(provider.name).toBe('openai');
    expect(provider.models).toContain('gpt-4');
  });

  it('prefers requested provider when available', () => {
    const selector = new ProviderSelector();
    const provider = selector.selectProvider('gpt-4', 'azure-openai');

    expect(provider.name).toBe('azure-openai');
  });

  it('falls back to default when model is not in any provider', () => {
    const selector = new ProviderSelector();
    const provider = selector.selectProvider('unknown-model');

    expect(provider).toBeDefined();
    expect(provider.models).toContain('unknown-model');
  });

  it('selects fallback when primary fails', () => {
    const selector = new ProviderSelector();
    const fallback = selector.selectFallback('gpt-4', 'openai');

    expect(fallback).not.toBeNull();
    expect(fallback!.model).not.toBe('gpt-4');
    expect(fallback!.provider.name).not.toBe('openai');
  });

  it('returns null when no fallback available', () => {
    const selector = new ProviderSelector();
    const fallback = selector.selectFallback('nonexistent-model', 'nonexistent-provider', { exclude: ['openai', 'anthropic', 'gemini', 'ollama', 'azure-openai', 'openrouter', 'mock'] });

    expect(fallback).toBeNull();
  });

  it('lists all providers', () => {
    const selector = new ProviderSelector();
    const providers = selector.listProviders();

    expect(providers).toContain('openai');
    expect(providers).toContain('anthropic');
    expect(providers).toContain('mock');
  });

  it('lists models for a provider', () => {
    const selector = new ProviderSelector();
    const models = selector.listModelsForProvider('anthropic');

    expect(models).toContain('claude-sonnet-4-20250514');
    expect(models).toContain('claude-haiku-3-5-20241022');
  });

  it('gets provider by name', () => {
    const selector = new ProviderSelector();
    const provider = selector.getProvider('openai');

    expect(provider).toBeDefined();
    expect(provider!.priority).toBe(1);
  });

  it('allows registering custom providers', () => {
    const selector = new ProviderSelector();
    selector.registerProvider({ name: 'custom', priority: 10, models: ['custom-model'] });

    expect(selector.getProvider('custom')).toBeDefined();
  });
});
