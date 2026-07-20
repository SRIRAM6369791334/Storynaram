import { Injectable, Logger } from '@nestjs/common';
import type { PluginId, PluginDescriptor, PluginHealth, PluginHealthEntry, HealthStatus } from './types';
import type { PluginRegistry } from './plugin-registry';

@Injectable()
export class PluginHealthService {
  private readonly logger = new Logger(PluginHealthService.name);
  private readonly healthCache: Map<PluginId, PluginHealthEntry> = new Map();
  private lastCheck: Date = new Date();

  constructor(
    private readonly registry: PluginRegistry,
  ) {}

  check(): PluginHealth {
    this.lastCheck = new Date();
    const descriptors = this.registry.list();
    const details: Record<PluginId, PluginHealthEntry> = {};

    for (const descriptor of descriptors) {
      details[descriptor.manifest.id] = this.evaluate(descriptor);
    }

    const activeCount = Object.values(details).filter(d => d.status === 'healthy').length;
    const failedCount = Object.values(details).filter(d => d.status === 'unhealthy').length;

    let overallStatus: HealthStatus = 'healthy';
    if (failedCount > 0) {
      overallStatus = activeCount > 0 ? 'degraded' : 'unhealthy';
    }

    return {
      status: overallStatus,
      totalPlugins: descriptors.length,
      activeCount,
      failedCount,
      lastChecked: this.lastCheck,
      details,
    };
  }

  getPluginHealth(pluginId: PluginId): PluginHealthEntry | undefined {
    return this.healthCache.get(pluginId);
  }

  private evaluate(descriptor: PluginDescriptor): PluginHealthEntry {
    const cached = this.healthCache.get(descriptor.manifest.id);
    const isActive = descriptor.status === 'started';
    const hasErrors = descriptor.errorCount > 0;

    let status: HealthStatus = 'healthy';
    const entry: PluginHealthEntry = {
      status,
      lastChecked: this.lastCheck,
    };

    if (!isActive) {
      status = 'degraded';
      entry.statusMessage = `Plugin status: ${descriptor.status}`;
    }

    if (hasErrors) {
      status = 'unhealthy';
      entry.statusMessage = `Plugin has ${descriptor.errorCount} error(s)`;
      entry.lastError = descriptor.lastError;
    }

    if (descriptor.startedAt) {
      entry.uptimeMs = Date.now() - descriptor.startedAt.getTime();
    }

    entry.status = status;
    this.healthCache.set(descriptor.manifest.id, entry);

    return entry;
  }

  clearCache(): void {
    this.healthCache.clear();
  }
}
