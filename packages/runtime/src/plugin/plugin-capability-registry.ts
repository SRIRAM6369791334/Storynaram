import { Injectable, Logger } from '@nestjs/common';
import type { PluginId, PluginCapability } from './types';

@Injectable()
export class PluginCapabilityRegistry {
  private readonly logger = new Logger(PluginCapabilityRegistry.name);
  private readonly capabilities: Map<string, { capability: PluginCapability; pluginId: PluginId }> = new Map();

  register(pluginId: PluginId, capability: PluginCapability): void {
    const key = `${capability.name}@${capability.version}`;
    if (this.capabilities.has(key)) {
      this.logger.warn(`Overwriting capability "${key}" from plugin "${this.capabilities.get(key)?.pluginId}" with "${pluginId}"`);
    }
    this.capabilities.set(key, { capability, pluginId });
    this.logger.log(`Plugin "${pluginId}" registered capability: ${capability.name} v${capability.version}`);
  }

  registerMany(pluginId: PluginId, capabilities: PluginCapability[]): void {
    for (const cap of capabilities) {
      this.register(pluginId, cap);
    }
  }

  unregister(pluginId: PluginId): void {
    for (const [key, entry] of this.capabilities.entries()) {
      if (entry.pluginId === pluginId) {
        this.capabilities.delete(key);
      }
    }
    this.logger.log(`Unregistered all capabilities for plugin: ${pluginId}`);
  }

  resolve(name: string, version?: string): PluginCapability | undefined {
    if (version) {
      return this.capabilities.get(`${name}@${version}`)?.capability;
    }
    const entries = Array.from(this.capabilities.values()).filter(e => e.capability.name === name);
    if (entries.length === 0) return undefined;
    entries.sort((a, b) => b.capability.version.localeCompare(a.capability.version));
    return entries[0]?.capability;
  }

  has(name: string, version?: string): boolean {
    return !!this.resolve(name, version);
  }

  list(): PluginCapability[] {
    return Array.from(this.capabilities.values()).map(e => e.capability);
  }

  listByPlugin(pluginId: PluginId): PluginCapability[] {
    return Array.from(this.capabilities.values())
      .filter(e => e.pluginId === pluginId)
      .map(e => e.capability);
  }

  clear(): void {
    this.capabilities.clear();
  }

  get size(): number {
    return this.capabilities.size;
  }
}
