import { Injectable } from '@nestjs/common';
import type { PluginId, PluginMetricsData, PluginDescriptor } from './types';

@Injectable()
export class PluginMetricsCollector {
  private readonly metrics: Map<PluginId, PluginMetricsData> = new Map();

  initializeForPlugin(pluginId: PluginId): void {
    if (!this.metrics.has(pluginId)) {
      this.metrics.set(pluginId, {
        hookExecutionTime: {},
        lifecycleTime: {},
        errorCount: 0,
        requestCount: 0,
      });
    }
  }

  recordHookExecution(pluginId: PluginId, hookName: string, durationMs: number): void {
    const data = this.getOrCreate(pluginId);
    data.hookExecutionTime[hookName] = (data.hookExecutionTime[hookName] ?? 0) + durationMs;
  }

  recordLifecycleTransition(pluginId: PluginId, transition: string, durationMs: number): void {
    const data = this.getOrCreate(pluginId);
    data.lifecycleTime[transition] = (data.lifecycleTime[transition] ?? 0) + durationMs;
  }

  recordError(pluginId: PluginId): void {
    const data = this.getOrCreate(pluginId);
    data.errorCount++;
  }

  recordRequest(pluginId: PluginId): void {
    const data = this.getOrCreate(pluginId);
    data.requestCount++;
  }

  getMetrics(pluginId: PluginId): PluginMetricsData | undefined {
    return this.metrics.get(pluginId);
  }

  getAllMetrics(): Map<PluginId, PluginMetricsData> {
    return new Map(this.metrics);
  }

  removePlugin(pluginId: PluginId): void {
    this.metrics.delete(pluginId);
  }

  clear(): void {
    this.metrics.clear();
  }

  private getOrCreate(pluginId: PluginId): PluginMetricsData {
    let data = this.metrics.get(pluginId);
    if (!data) {
      data = { hookExecutionTime: {}, lifecycleTime: {}, errorCount: 0, requestCount: 0 };
      this.metrics.set(pluginId, data);
    }
    return data;
  }
}
