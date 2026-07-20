import { describe, it, expect, beforeEach } from 'vitest';
import { PluginRegistry, PluginError } from '../src/plugin';
import type { PluginDescriptor } from '../src/plugin';

describe('PluginRegistry', () => {
  let registry: PluginRegistry;

  function createDescriptor(id: string, version = '1.0.0', status = 'discovered'): PluginDescriptor {
    return {
      manifest: { id, name: id, version },
      status: status as PluginDescriptor['status'],
      errorCount: 0,
      hooks: 0,
      metadata: {},
    };
  }

  beforeEach(() => {
    registry = new PluginRegistry();
  });

  it('should register and resolve plugins', () => {
    const desc = createDescriptor('plugin-a');
    registry.register(desc);
    expect(registry.has('plugin-a')).toBe(true);
    expect(registry.resolve('plugin-a').manifest.id).toBe('plugin-a');
  });

  it('should throw when resolving unknown plugin', () => {
    expect(() => registry.resolve('unknown')).toThrow(PluginError);
    expect(() => registry.resolve('unknown')).toThrow('not registered');
  });

  it('should return undefined for get on unknown plugin', () => {
    expect(registry.get('unknown')).toBeUndefined();
  });

  it('should list all registered plugins', () => {
    registry.register(createDescriptor('a'));
    registry.register(createDescriptor('b'));
    registry.register(createDescriptor('c'));
    expect(registry.list()).toHaveLength(3);
  });

  it('should list plugins by status', () => {
    registry.register(createDescriptor('a', '1.0.0', 'started'));
    registry.register(createDescriptor('b', '1.0.0', 'stopped'));
    registry.register(createDescriptor('c', '1.0.0', 'started'));

    const started = registry.listByStatus('started');
    expect(started).toHaveLength(2);
    expect(started.map(d => d.manifest.id)).toEqual(['a', 'c']);
  });

  it('should unregister plugins', () => {
    registry.register(createDescriptor('a'));
    expect(registry.unregister('a')).toBe(true);
    expect(registry.has('a')).toBe(false);
    expect(registry.unregister('nonexistent')).toBe(false);
  });

  it('should update plugin descriptors', () => {
    const desc = createDescriptor('a');
    registry.register(desc);
    registry.update('a', { status: 'started', errorCount: 1 });
    const updated = registry.resolve('a');
    expect(updated.status).toBe('started');
    expect(updated.errorCount).toBe(1);
  });

  it('should clear all plugins', () => {
    registry.register(createDescriptor('a'));
    registry.register(createDescriptor('b'));
    registry.clear();
    expect(registry.size).toBe(0);
  });

  it('should report size', () => {
    expect(registry.size).toBe(0);
    registry.register(createDescriptor('a'));
    expect(registry.size).toBe(1);
    registry.register(createDescriptor('b'));
    expect(registry.size).toBe(2);
  });

  it('should compute statistics', () => {
    registry.register(createDescriptor('a', '1.0.0', 'started'));
    registry.register(createDescriptor('b', '1.0.0', 'stopped'));
    registry.register(createDescriptor('c', '1.0.0', 'started'));
    registry.register(createDescriptor('d', '2.0.0', 'discovered'));

    const stats = registry.statistics();
    expect(stats.totalPlugins).toBe(4);
    expect(stats.activePlugins).toBe(2);
    expect(stats.stoppedPlugins).toBe(1);
    expect(stats.totalHooks).toBe(0);
    expect(stats.averageLoadTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('should overwrite existing plugin on re-register', () => {
    registry.register(createDescriptor('a', '1.0.0'));
    registry.register(createDescriptor('a', '2.0.0'));
    expect(registry.resolve('a').manifest.version).toBe('2.0.0');
  });
});
