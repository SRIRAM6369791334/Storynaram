import { describe, it, expect, beforeEach } from 'vitest';
import { PluginDependencyResolver, PluginDependencyError, PluginManifestService, PluginDescriptorFactory } from '../src/plugin';
import type { PluginManifest } from '../src/plugin';

describe('PluginDependencyResolver', () => {
  let resolver: PluginDependencyResolver;

  function make(id: string, deps?: string[], version = '1.0.0'): PluginManifest {
    return {
      id,
      name: id,
      version,
      dependencies: deps?.map(d => ({ id: d })) ?? [],
    };
  }

  beforeEach(() => {
    resolver = new PluginDependencyResolver();
  });

  it('should resolve plugins with no dependencies', () => {
    const manifests = [make('a'), make('b')];
    const resolved = resolver.resolve(manifests);
    expect(resolved).toHaveLength(2);
  });

  it('should respect dependency order', () => {
    const manifests = [make('b', ['a']), make('a')];
    const resolved = resolver.resolve(manifests);
    expect(resolved[0]?.id).toBe('a');
    expect(resolved[1]?.id).toBe('b');
  });

  it('should handle diamond dependencies', () => {
    const manifests = [
      make('d', ['b', 'c']),
      make('b', ['a']),
      make('c', ['a']),
      make('a'),
    ];
    const resolved = resolver.resolve(manifests);
    expect(resolved[0]?.id).toBe('a');
  });

  it('should detect circular dependencies', () => {
    const manifests = [make('a', ['b']), make('b', ['a'])];
    expect(() => resolver.resolve(manifests)).toThrow(PluginDependencyError);
    expect(() => resolver.resolve(manifests)).toThrow('Circular');
  });

  it('should detect longer circular chains', () => {
    const manifests = [make('a', ['b']), make('b', ['c']), make('c', ['a'])];
    expect(() => resolver.resolve(manifests)).toThrow(PluginDependencyError);
  });

  it('should validate dependencies against available plugins', () => {
    const manifest = make('b', ['a']);
    const available = new Map([['a', make('a')]]);
    expect(() => resolver.validateDependencies(manifest, available)).not.toThrow();
  });

  it('should throw on missing required dependencies', () => {
    const manifest = make('b', ['a']);
    const available = new Map<string, PluginManifest>();
    expect(() => resolver.validateDependencies(manifest, available)).toThrow(PluginDependencyError);
    expect(() => resolver.validateDependencies(manifest, available)).toThrow('missing dependency');
  });

  it('should get missing dependencies', () => {
    const manifest = make('b', ['a', 'c']);
    const available = new Map([['a', make('a')]]);
    const missing = resolver.getMissingDependencies(manifest, available);
    expect(missing).toEqual(['c']);
  });

  it('should handle optional dependencies', () => {
    const manifest = {
      id: 'b',
      name: 'b',
      version: '1.0.0',
      dependencies: [{ id: 'a', optional: true }],
    };
    const available = new Map<string, PluginManifest>();
    const missing = resolver.getMissingDependencies(manifest, available);
    expect(missing).toEqual([]);
  });

  it('should handle self-dependency', () => {
    const manifests = [make('a', ['a'])];
    expect(() => resolver.resolve(manifests)).toThrow(PluginDependencyError);
  });
});
