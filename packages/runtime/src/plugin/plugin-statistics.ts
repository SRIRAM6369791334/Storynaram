import { Injectable } from '@nestjs/common';
import type { PluginId, PluginStatistics } from './types';
import type { PluginRegistry } from './plugin-registry';
import type { PluginHookRegistry } from './plugin-hook-registry';
import type { PluginCapabilityRegistry } from './plugin-capability-registry';
import type { PluginMetricsCollector } from './plugin-metrics';

@Injectable()
export class PluginStatisticsService {
  constructor(
    private readonly registry: PluginRegistry,
    private readonly hookRegistry: PluginHookRegistry,
    private readonly capabilityRegistry: PluginCapabilityRegistry,
    private readonly metrics: PluginMetricsCollector,
  ) {}

  getStatistics(): PluginStatistics {
    return this.registry.statistics();
  }

  getDetailedStatistics(): PluginStatistics & { hooksByPlugin: Record<PluginId, number>; capabilitiesByPlugin: Record<PluginId, number> } {
    const base = this.getStatistics();
    const descriptors = this.registry.list();

    const hooksByPlugin: Record<PluginId, number> = {};
    const capabilitiesByPlugin: Record<PluginId, number> = {};

    for (const d of descriptors) {
      const pid = d.manifest.id;
      hooksByPlugin[pid] = this.hookRegistry.countHooksForPlugin(pid);
      capabilitiesByPlugin[pid] = this.capabilityRegistry.listByPlugin(pid).length;
    }

    return {
      ...base,
      hooksByPlugin,
      capabilitiesByPlugin,
    };
  }
}
