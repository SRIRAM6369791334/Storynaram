import { Injectable, Logger } from '@nestjs/common';
import type { PluginId, PluginPermission } from './types';
import { PluginPermissionError } from './errors';

@Injectable()
export class PluginPermissionManager {
  private readonly logger = new Logger(PluginPermissionManager.name);
  private readonly permissions: Map<PluginId, PluginPermission[]> = new Map();
  private enabled = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.logger.log(`Permission checks ${enabled ? 'enabled' : 'disabled'}`);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  register(pluginId: PluginId, permissions: PluginPermission[]): void {
    this.permissions.set(pluginId, [...permissions]);
    this.logger.log(`Registered ${permissions.length} permissions for plugin: ${pluginId}`);
  }

  unregister(pluginId: PluginId): void {
    this.permissions.delete(pluginId);
  }

  check(pluginId: PluginId, resource: string, action: string): void {
    if (!this.enabled) return;

    const pluginPerms = this.permissions.get(pluginId);
    if (!pluginPerms) {
      throw new PluginPermissionError(
        `Plugin "${pluginId}" has no registered permissions`,
        pluginId,
        resource,
        action,
      );
    }

    for (const perm of pluginPerms) {
      if (this.matches(perm.resource, resource) && perm.actions.includes(action)) {
        return;
      }
      if (perm.resource === '*' && perm.actions.includes('*')) {
        return;
      }
      if (perm.resource === '*' && perm.actions.includes(action)) {
        return;
      }
      if (perm.resource === resource && perm.actions.includes('*')) {
        return;
      }
    }

    throw new PluginPermissionError(
      `Plugin "${pluginId}" does not have permission to "${action}" on "${resource}"`,
      pluginId,
      resource,
      action,
    );
  }

  has(pluginId: PluginId, resource: string, action: string): boolean {
    try {
      this.check(pluginId, resource, action);
      return true;
    } catch {
      return false;
    }
  }

  getPermissions(pluginId: PluginId): PluginPermission[] {
    return [...(this.permissions.get(pluginId) ?? [])];
  }

  clear(): void {
    this.permissions.clear();
  }

  private matches(pattern: string, actual: string): boolean {
    if (pattern === '*') return true;
    if (pattern.endsWith(':*')) {
      return actual.startsWith(pattern.slice(0, -2));
    }
    return pattern === actual;
  }
}
