import { Injectable, Logger } from '@nestjs/common';
import type { PluginManifest, PluginDescriptor, PluginId, PluginContext, PluginStatistics, PluginRuntimeOptions, PluginHookHandler, HookType } from './types.js';
import { PluginManager } from './plugin-manager.js';
import { PluginHookRegistry } from './plugin-hook-registry.js';
import { PluginEventBridge } from './plugin-event-bridge.js';
import { PluginCapabilityRegistry } from './plugin-capability-registry.js';
import { PluginPermissionManager } from './plugin-permission-manager.js';
import { PluginConfigurationService } from './plugin-configuration.js';
import { PluginHealthService } from './plugin-health.service.js';
import { PluginMetricsCollector } from './plugin-metrics.js';
import { PluginRegistry } from './plugin-registry.js';

@Injectable()
export class PluginRuntimeService {
  private readonly logger = new Logger(PluginRuntimeService.name);

  constructor(
    private readonly manager: PluginManager,
    private readonly hookRegistry: PluginHookRegistry,
    private readonly eventBridge: PluginEventBridge,
    private readonly capabilityRegistry: PluginCapabilityRegistry,
    private readonly permissionManager: PluginPermissionManager,
    private readonly configurationService: PluginConfigurationService,
    private readonly healthService: PluginHealthService,
    private readonly metrics: PluginMetricsCollector,
    private readonly registry: PluginRegistry,
  ) {}

  initialize(options?: PluginRuntimeOptions): void {
    this.manager.setOptions(options ?? {});
    this.logger.log('Plugin runtime initialized');
  }

  discover(manifest: PluginManifest): Promise<PluginDescriptor> {
    return this.manager.discover(manifest);
  }

  load(pluginId: PluginId): Promise<PluginDescriptor> {
    return this.manager.load(pluginId);
  }

  initializePlugin(pluginId: PluginId): Promise<PluginDescriptor> {
    return this.manager.initialize(pluginId);
  }

  start(pluginId: PluginId, services?: Record<string, unknown>): Promise<PluginDescriptor> {
    return this.manager.start(pluginId, services);
  }

  stop(pluginId: PluginId): Promise<PluginDescriptor> {
    return this.manager.stop(pluginId);
  }

  reload(pluginId: PluginId, services?: Record<string, unknown>): Promise<PluginDescriptor> {
    return this.manager.reload(pluginId, services);
  }

  disable(pluginId: PluginId): Promise<PluginDescriptor> {
    return this.manager.disable(pluginId);
  }

  unload(pluginId: PluginId): Promise<PluginDescriptor> {
    return this.manager.unload(pluginId);
  }

  destroy(pluginId: PluginId): Promise<void> {
    return this.manager.destroy(pluginId);
  }

  loadAndStart(manifest: PluginManifest, services?: Record<string, unknown>): Promise<PluginDescriptor> {
    return this.manager.loadAndStart(manifest, services);
  }

  startAll(services?: Record<string, unknown>): Promise<PluginDescriptor[]> {
    return this.manager.startAll(services);
  }

  stopAll(): Promise<void> {
    return this.manager.stopAll();
  }

  getContext(pluginId: PluginId): PluginContext | undefined {
    return this.manager.getContext(pluginId);
  }

  getDescriptor(pluginId: PluginId): PluginDescriptor {
    return this.manager.getDescriptor(pluginId);
  }

  listPlugins(): PluginDescriptor[] {
    return this.manager.listDescriptors();
  }

  getStatus(pluginId: PluginId): string {
    return this.manager.getStatus(pluginId);
  }

  getStatistics(): PluginStatistics {
    return this.manager.getStatistics();
  }

  health(): ReturnType<PluginHealthService['check']> {
    return this.manager.health();
  }

  getPluginHealth(pluginId: PluginId): ReturnType<PluginHealthService['getPluginHealth']> {
    return this.healthService.getPluginHealth(pluginId);
  }

  registerHook(pluginId: PluginId, hookName: string, handler: PluginHookHandler, options?: { priority?: number; type?: HookType }): void {
    this.hookRegistry.register(pluginId, hookName, handler, options);
  }

  unregisterHook(pluginId: PluginId, hookName: string): void {
    this.hookRegistry.unregister(pluginId, hookName);
  }

  executeBeforeHook(hookName: string, ...args: unknown[]): Promise<void> {
    return this.hookRegistry.executeBefore(hookName, ...args);
  }

  executeAfterHook(hookName: string, result: unknown, ...args: unknown[]): Promise<void> {
    return this.hookRegistry.executeAfter(hookName, result, ...args);
  }

  executeAroundHook<T>(hookName: string, fn: () => Promise<T>, ...args: unknown[]): Promise<T> {
    return this.hookRegistry.executeAround(hookName, fn, ...args);
  }

  publishEvent(eventType: string, pluginId: PluginId, payload: Record<string, unknown>): Promise<void> {
    return this.eventBridge.publish(eventType, pluginId, payload);
  }

  registerCapability(pluginId: PluginId, name: string, version: string, description?: string): void {
    this.capabilityRegistry.register(pluginId, { name, version, description });
  }

  hasCapability(name: string, version?: string): boolean {
    return this.capabilityRegistry.has(name, version);
  }

  checkPermission(pluginId: PluginId, resource: string, action: string): boolean {
    return this.permissionManager.has(pluginId, resource, action);
  }

  setPluginConfig(pluginId: PluginId, config: Record<string, unknown>): void {
    this.configurationService.set(pluginId, config);
  }

  getPluginConfig(pluginId: PluginId): Record<string, unknown> {
    return this.configurationService.get(pluginId);
  }

  getMetricsForPlugin(pluginId: PluginId): ReturnType<PluginMetricsCollector['getMetrics']> {
    return this.metrics.getMetrics(pluginId);
  }

  getHookNames(): string[] {
    return this.hookRegistry.listHookNames();
  }

  getRegisteredPluginIds(): PluginId[] {
    return this.registry.list().map(d => d.manifest.id);
  }
}
