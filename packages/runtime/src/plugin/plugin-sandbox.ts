import { Injectable, Logger } from '@nestjs/common';
import type { PluginId, PluginDescriptor, PluginPermission } from './types';
import { PluginPermissionError } from './errors';
import type { PluginPermissionManager } from './plugin-permission-manager';

@Injectable()
export class PluginSandbox {
  private readonly logger = new Logger(PluginSandbox.name);
  private readonly pluginAccess: Map<PluginId, Set<string>> = new Map();

  constructor(
    private readonly permissionManager: PluginPermissionManager,
  ) {}

  initialize(descriptor: PluginDescriptor): void {
    const pluginId = descriptor.manifest.id;
    const access = new Set<string>();
    for (const perm of descriptor.manifest.permissions ?? []) {
      for (const action of perm.actions) {
        access.add(`${perm.resource}:${action}`);
      }
    }
    this.pluginAccess.set(pluginId, access);
    this.logger.log(`Sandbox initialized for plugin: ${pluginId}`);
  }

  checkPermission(pluginId: PluginId, resource: string, action: string): void {
    const access = this.pluginAccess.get(pluginId);
    if (!access || !access.has(`${resource}:${action}`)) {
      throw new PluginPermissionError(
        `Plugin "${pluginId}" does not have permission to ${action} on "${resource}"`,
        pluginId,
        resource,
        action,
      );
    }
  }

  hasPermission(pluginId: PluginId, resource: string, action: string): boolean {
    try {
      this.checkPermission(pluginId, resource, action);
      return true;
    } catch {
      return false;
    }
  }

  getPermissions(pluginId: PluginId): PluginPermission[] {
    const access = this.pluginAccess.get(pluginId);
    if (!access) return [];

    const permissionMap = new Map<string, string[]>();
    for (const entry of access) {
      const colonIndex = entry.indexOf(':');
      if (colonIndex === -1) continue;
      const resource = entry.slice(0, colonIndex);
      const action = entry.slice(colonIndex + 1);
      const actions = permissionMap.get(resource) ?? [];
      actions.push(action);
      permissionMap.set(resource, actions);
    }

    return Array.from(permissionMap.entries()).map(([resource, actions]) => ({
      resource,
      actions,
    }));
  }

  release(pluginId: PluginId): void {
    this.pluginAccess.delete(pluginId);
    this.logger.log(`Sandbox released for plugin: ${pluginId}`);
  }

  clear(): void {
    this.pluginAccess.clear();
  }
}
