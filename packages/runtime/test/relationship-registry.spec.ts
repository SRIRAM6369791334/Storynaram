import { describe, it, expect, beforeEach } from 'vitest';
import { RelationshipRegistry } from '../src/relationship/relationship-registry';

describe('RelationshipRegistry', () => {
  let registry: RelationshipRegistry;

  beforeEach(() => {
    registry = new RelationshipRegistry();
  });

  it('should register and retrieve a config', () => {
    registry.registerConfig({ type: 'hierarchical', allowCycles: false, maxTargets: 1 });
    const config = registry.getConfig('hierarchical');
    expect(config).toBeDefined();
    expect(config!.allowCycles).toBe(false);
    expect(config!.maxTargets).toBe(1);
  });

  it('should unregister a config', () => {
    registry.registerConfig({ type: 'directed', allowCycles: true });
    expect(registry.hasConfig('directed')).toBe(true);
    registry.unregisterConfig('directed');
    expect(registry.hasConfig('directed')).toBe(false);
  });

  it('should list registered configs', () => {
    registry.registerConfig({ type: 'oneToOne', maxTargets: 1, allowCycles: false });
    registry.registerConfig({ type: 'manyToMany', allowCycles: true });
    const configs = registry.listConfigs();
    expect(configs.length).toBe(2);
  });

  it('should list registered types', () => {
    registry.registerConfig({ type: 'ownership', allowCycles: false });
    registry.registerConfig({ type: 'reference', allowCycles: true });
    const types = registry.listTypes();
    expect(types).toContain('ownership');
    expect(types).toContain('reference');
  });

  it('should load default configs', () => {
    registry.registerDefaultConfigs();
    expect(registry.hasConfig('oneToOne')).toBe(true);
    expect(registry.hasConfig('oneToMany')).toBe(true);
    expect(registry.hasConfig('manyToMany')).toBe(true);
    expect(registry.hasConfig('directed')).toBe(true);
    expect(registry.hasConfig('bidirectional')).toBe(true);
    expect(registry.hasConfig('hierarchical')).toBe(true);
    expect(registry.hasConfig('reference')).toBe(true);
    expect(registry.hasConfig('dependency')).toBe(true);
    expect(registry.hasConfig('ownership')).toBe(true);
  });

  it('should not override existing configs when loading defaults', () => {
    registry.registerConfig({ type: 'directed', allowCycles: false });
    registry.registerDefaultConfigs();
    const config = registry.getConfig('directed');
    expect(config!.allowCycles).toBe(false); // kept our override
  });
});
