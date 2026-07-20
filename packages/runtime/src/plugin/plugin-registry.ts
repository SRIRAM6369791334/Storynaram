import { Injectable, Logger } from '@nestjs/common';
import type { PluginId, PluginDescriptor, PluginStatistics } from './types';
import { PluginError } from './errors';

@Injectable()
export class PluginRegistry {
  private readonly logger = new Logger(PluginRegistry.name);
  private readonly plugins: Map<PluginId, PluginDescriptor> = new Map();

  register(descriptor: PluginDescriptor): void {
    if (this.plugins.has(descriptor.manifest.id)) {
      this.logger.warn(`Overwriting existing plugin: ${descriptor.manifest.id}`);
    }
    this.plugins.set(descriptor.manifest.id, descriptor);
    this.logger.log(`Registered plugin: ${descriptor.manifest.id} v${descriptor.manifest.version}`);
  }

  resolve(id: PluginId): PluginDescriptor {
    const descriptor = this.plugins.get(id);
    if (!descriptor) {
      throw new PluginError(`Plugin "${id}" is not registered`, 'PLUGIN_NOT_FOUND');
    }
    return descriptor;
  }

  get(id: PluginId): PluginDescriptor | undefined {
    return this.plugins.get(id);
  }

  has(id: PluginId): boolean {
    return this.plugins.has(id);
  }

  list(): PluginDescriptor[] {
    return Array.from(this.plugins.values());
  }

  listByStatus(status: string): PluginDescriptor[] {
    return this.list().filter(p => p.status === status);
  }

  unregister(id: PluginId): boolean {
    const existed = this.plugins.delete(id);
    if (existed) {
      this.logger.log(`Unregistered plugin: ${id}`);
    }
    return existed;
  }

  update(id: PluginId, updates: Partial<PluginDescriptor>): void {
    const descriptor = this.resolve(id);
    Object.assign(descriptor, updates);
  }

  clear(): void {
    this.plugins.clear();
    this.logger.log('Plugin registry cleared');
  }

  get size(): number {
    return this.plugins.size;
  }

  statistics(): PluginStatistics {
    const descriptors = this.list();
    const activePlugins = descriptors.filter(p => p.status === 'started').length;
    const stoppedPlugins = descriptors.filter(p => p.status === 'stopped').length;
    const failedPlugins = descriptors.filter(p => p.status === 'destroyed' || p.errorCount > 0).length;
    const totalHooks = descriptors.reduce((sum, p) => sum + p.hooks, 0);
    const totalCapabilities = descriptors.reduce((sum, p) => sum + (p.manifest.capabilities?.length ?? 0), 0);
    const totalErrors = descriptors.reduce((sum, p) => sum + p.errorCount, 0);
    const loadTimes = descriptors
      .filter(p => p.startedAt && p.status !== 'discovered')
      .map(p => (p.startedAt ? Date.now() - p.startedAt.getTime() : 0));
    const averageLoadTimeMs = loadTimes.length > 0
      ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length
      : 0;

    return {
      totalPlugins: descriptors.length,
      activePlugins,
      stoppedPlugins,
      failedPlugins,
      totalHooks,
      totalCapabilities,
      averageLoadTimeMs,
      totalErrors,
    };
  }
}
