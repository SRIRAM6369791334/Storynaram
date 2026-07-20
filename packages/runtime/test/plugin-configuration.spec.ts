import { describe, it, expect, beforeEach } from 'vitest';
import { PluginConfigurationService, PluginConfigurationError } from '../src/plugin';
import type { PluginManifest } from '../src/plugin';

describe('PluginConfigurationService', () => {
  let config: PluginConfigurationService;

  beforeEach(() => {
    config = new PluginConfigurationService();
  });

  it('should set and get configuration', () => {
    config.set('plugin-a', { key: 'value', number: 42 });
    expect(config.get('plugin-a')).toEqual({ key: 'value', number: 42 });
  });

  it('should return empty object for unknown plugin', () => {
    expect(config.get('unknown')).toEqual({});
  });

  it('should get specific value', () => {
    config.set('plugin-a', { key: 'value', flag: true });
    expect(config.getValue('plugin-a', 'key')).toBe('value');
    expect(config.getValue('plugin-a', 'flag')).toBe(true);
    expect(config.getValue('plugin-a', 'nonexistent')).toBeUndefined();
  });

  it('should return default value for missing key', () => {
    config.set('plugin-a', { existing: 'yes' });
    expect(config.getValue('plugin-a', 'missing', 'default')).toBe('default');
  });

  it('should update partial configuration', () => {
    config.set('plugin-a', { a: 1, b: 2 });
    config.update('plugin-a', { b: 3, c: 4 });
    expect(config.get('plugin-a')).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('should delete configuration', () => {
    config.set('plugin-a', { key: 'value' });
    expect(config.has('plugin-a')).toBe(true);
    config.delete('plugin-a');
    expect(config.has('plugin-a')).toBe(false);
    expect(config.get('plugin-a')).toEqual({});
  });

  it('should validate against schema', () => {
    const schema = {
      properties: {
        name: { type: 'string' },
        count: { type: 'integer' },
        items: { type: 'array' },
      },
    };

    const issues = config.validateAgainstSchema(
      { name: 'test', count: 5, items: [1, 2] },
      schema,
    );
    expect(issues).toEqual([]);
  });

  it('should detect type mismatches in schema', () => {
    const schema = {
      properties: {
        name: { type: 'string' },
        count: { type: 'number' },
      },
    };

    const issues = config.validateAgainstSchema({ name: 42, count: 'not-a-number' }, schema);
    expect(issues.length).toBeGreaterThan(0);
  });

  it('should validate manifest config', () => {
    const manifest: PluginManifest = {
      id: 'test',
      name: 'Test',
      version: '1.0.0',
      configurationSchema: {
        properties: {
          apiKey: { type: 'string', required: true },
        },
      },
    };

    expect(() => config.validateManifestConfig(manifest, {})).toThrow(PluginConfigurationError);
    expect(() => config.validateManifestConfig(manifest, { apiKey: 'abc' })).not.toThrow();
  });

  it('should skip validation when no schema in manifest', () => {
    const manifest: PluginManifest = {
      id: 'test',
      name: 'Test',
      version: '1.0.0',
    };

    expect(() => config.validateManifestConfig(manifest, { anything: 'goes' })).not.toThrow();
  });

  it('should set from options', () => {
    config.setFromOptions({
      'plugin-a': { key: 'value' },
      'plugin-b': { enabled: true },
    });
    expect(config.get('plugin-a')).toEqual({ key: 'value' });
    expect(config.get('plugin-b')).toEqual({ enabled: true });
  });

  it('should report size', () => {
    expect(config.size).toBe(0);
    config.set('plugin-a', {});
    expect(config.size).toBe(1);
    config.clear();
    expect(config.size).toBe(0);
  });
});
