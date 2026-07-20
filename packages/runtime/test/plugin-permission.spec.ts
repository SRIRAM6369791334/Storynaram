import { describe, it, expect, beforeEach } from 'vitest';
import { PluginPermissionManager, PluginPermissionError } from '../src/plugin';

describe('PluginPermissionManager', () => {
  let manager: PluginPermissionManager;

  beforeEach(() => {
    manager = new PluginPermissionManager();
  });

  it('should register and check permissions', () => {
    manager.register('plugin-a', [{ resource: 'workflow', actions: ['read', 'write'] }]);
    expect(() => manager.check('plugin-a', 'workflow', 'read')).not.toThrow();
    expect(() => manager.check('plugin-a', 'workflow', 'write')).not.toThrow();
  });

  it('should throw on missing permission', () => {
    manager.register('plugin-a', [{ resource: 'workflow', actions: ['read'] }]);
    expect(() => manager.check('plugin-a', 'workflow', 'delete')).toThrow(PluginPermissionError);
    expect(() => manager.check('plugin-a', 'ai', 'read')).toThrow(PluginPermissionError);
  });

  it('should support wildcard resource', () => {
    manager.register('plugin-a', [{ resource: '*', actions: ['read'] }]);
    expect(() => manager.check('plugin-a', 'workflow', 'read')).not.toThrow();
    expect(() => manager.check('plugin-a', 'ai', 'read')).not.toThrow();
    expect(() => manager.check('plugin-a', 'ai', 'write')).toThrow(PluginPermissionError);
  });

  it('should support wildcard action', () => {
    manager.register('plugin-a', [{ resource: 'workflow', actions: ['*'] }]);
    expect(() => manager.check('plugin-a', 'workflow', 'read')).not.toThrow();
    expect(() => manager.check('plugin-a', 'workflow', 'delete')).not.toThrow();
    expect(() => manager.check('plugin-a', 'ai', 'read')).toThrow(PluginPermissionError);
  });

  it('should support wildcard resource prefix', () => {
    manager.register('plugin-a', [{ resource: 'workflow:*', actions: ['read'] }]);
    expect(() => manager.check('plugin-a', 'workflow:execution', 'read')).not.toThrow();
    expect(() => manager.check('plugin-a', 'ai', 'read')).toThrow(PluginPermissionError);
  });

  it('should return has() boolean', () => {
    manager.register('plugin-a', [{ resource: 'workflow', actions: ['read'] }]);
    expect(manager.has('plugin-a', 'workflow', 'read')).toBe(true);
    expect(manager.has('plugin-a', 'workflow', 'write')).toBe(false);
  });

  it('should throw when plugin has no registered permissions', () => {
    expect(() => manager.check('unknown', 'workflow', 'read')).toThrow(PluginPermissionError);
    expect(() => manager.check('unknown', 'workflow', 'read')).toThrow('no registered permissions');
  });

  it('should get permissions for a plugin', () => {
    manager.register('plugin-a', [{ resource: 'workflow', actions: ['read', 'write'] }]);
    const perms = manager.getPermissions('plugin-a');
    expect(perms).toHaveLength(1);
    expect(perms[0]?.actions).toEqual(['read', 'write']);
  });

  it('should unregister permissions', () => {
    manager.register('plugin-a', [{ resource: 'workflow', actions: ['read'] }]);
    manager.unregister('plugin-a');
    expect(() => manager.check('plugin-a', 'workflow', 'read')).toThrow();
  });

  it('should respect enabled/disabled', () => {
    manager.register('plugin-a', [{ resource: 'workflow', actions: ['read'] }]);
    manager.setEnabled(false);
    expect(() => manager.check('plugin-a', 'workflow', 'write')).not.toThrow();
    expect(manager.isEnabled()).toBe(false);

    manager.setEnabled(true);
    expect(() => manager.check('plugin-a', 'workflow', 'write')).toThrow();
  });

  it('should clear all permissions', () => {
    manager.register('plugin-a', [{ resource: 'workflow', actions: ['read'] }]);
    manager.clear();
    expect(() => manager.check('plugin-a', 'workflow', 'read')).toThrow();
  });
});
