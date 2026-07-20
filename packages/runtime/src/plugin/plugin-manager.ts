import { Injectable, Logger } from '@nestjs/common';
import type { PluginManifest, PluginDescriptor, PluginId, PluginStatus, PluginContext, PluginStatistics, PluginRuntimeOptions } from './types';
import { PluginRegistry } from './plugin-registry';
import { PluginLoader } from './plugin-loader';
import { PluginLifecycle } from './plugin-lifecycle';
import { PluginDependencyResolver } from './plugin-dependency-resolver';
import { PluginCapabilityRegistry } from './plugin-capability-registry';
import { PluginPermissionManager } from './plugin-permission-manager';
import { PluginConfigurationService } from './plugin-configuration';
import { PluginHookRegistry } from './plugin-hook-registry';
import { PluginEventBridge } from './plugin-event-bridge';
import { PluginContextFactory } from './plugin-context';
import { PluginSandbox } from './plugin-sandbox';
import { PluginHealthService } from './plugin-health.service';
import { PluginMetricsCollector } from './plugin-metrics';
import { PluginStatisticsService } from './plugin-statistics';
import { PluginDescriptorFactory } from './plugin-descriptor';
import { PluginManifestService } from './plugin-manifest';
import { v4 as uuid } from 'uuid';

@Injectable()
export class PluginManager {
  private readonly logger = new Logger(PluginManager.name);
  private readonly contexts: Map<PluginId, PluginContext> = new Map();
  private options: PluginRuntimeOptions = {};

  constructor(
    private readonly registry: PluginRegistry,
    private readonly loader: PluginLoader,
    private readonly lifecycle: PluginLifecycle,
    private readonly dependencyResolver: PluginDependencyResolver,
    private readonly capabilityRegistry: PluginCapabilityRegistry,
    private readonly permissionManager: PluginPermissionManager,
    private readonly configurationService: PluginConfigurationService,
    private readonly hookRegistry: PluginHookRegistry,
    private readonly eventBridge: PluginEventBridge,
    private readonly contextFactory: PluginContextFactory,
    private readonly sandbox: PluginSandbox,
    private readonly healthService: PluginHealthService,
    private readonly metrics: PluginMetricsCollector,
    private readonly statisticsService: PluginStatisticsService,
    private readonly descriptorFactory: PluginDescriptorFactory,
    private readonly manifestService: PluginManifestService,
  ) {}

  setOptions(options: PluginRuntimeOptions): void {
    this.options = options;
    if (options.defaultConfig) {
      this.configurationService.setFromOptions(options.defaultConfig);
    }
    if (options.enablePermissions === false) {
      this.permissionManager.setEnabled(false);
    }
    if (options.enableEventBridge === false) {
      this.eventBridge.setEnabled(false);
    }
  }

  async discover(manifest: PluginManifest): Promise<PluginDescriptor> {
    this.manifestService.validate(manifest);
    const descriptor = this.descriptorFactory.create(manifest, 'discovered');
    this.registry.register(descriptor);
    this.configurationService.set(manifest.id, {});
    this.metrics.initializeForPlugin(manifest.id);
    this.logger.log(`Discovered plugin: ${manifest.id} v${manifest.version}`);
    return descriptor;
  }

  async load(pluginId: PluginId): Promise<PluginDescriptor> {
    const descriptor = this.registry.resolve(pluginId);
    this.lifecycle.assertCanTransition(descriptor.status, 'loaded');

    const manifest = descriptor.manifest;
    const available = new Map(
      this.registry.list()
        .filter(d => d.status !== 'destroyed' && d.status !== 'discovered')
        .map(d => [d.manifest.id, d.manifest]),
    );

    this.dependencyResolver.validateDependencies(manifest, available);

    const loaded = this.loader.loadManifest(manifest);
    const updated = this.lifecycle.transition(descriptor, 'loaded');
    this.registry.update(pluginId, updated);

    await this.eventBridge.publishLoaded(pluginId);

    return updated;
  }

  async initialize(pluginId: PluginId): Promise<PluginDescriptor> {
    const descriptor = this.registry.resolve(pluginId);
    this.lifecycle.assertCanTransition(descriptor.status, 'initialized');

    const manifest = descriptor.manifest;

    if (manifest.capabilities) {
      this.capabilityRegistry.registerMany(pluginId, manifest.capabilities);
    }

    if (manifest.permissions && this.permissionManager.isEnabled()) {
      this.permissionManager.register(pluginId, manifest.permissions);
    }

    const config = this.configurationService.get(pluginId);
    this.configurationService.validateManifestConfig(manifest, config);

    this.sandbox.initialize(descriptor);

    const updated = this.lifecycle.transition(descriptor, 'initialized');
    this.registry.update(pluginId, updated);

    this.logger.log(`Initialized plugin: ${pluginId}`);
    return updated;
  }

  async start(pluginId: PluginId, services?: Record<string, unknown>): Promise<PluginDescriptor> {
    const now = Date.now();
    const descriptor = this.registry.resolve(pluginId);
    this.lifecycle.assertCanTransition(descriptor.status, 'started');

    const context = this.contextFactory.createContext(descriptor, services ?? {});
    this.contexts.set(pluginId, context);

    await this.hookRegistry.executeBefore(`plugin:start`, pluginId);

    const updated = this.lifecycle.transition(descriptor, 'started');
    this.registry.update(pluginId, updated);

    await this.eventBridge.publishStarted(pluginId);

    await this.hookRegistry.executeAfter(`plugin:start`, updated, pluginId);

    const duration = Date.now() - now;
    this.metrics.recordLifecycleTransition(pluginId, 'start', duration);

    this.logger.log(`Started plugin: ${pluginId} (${duration}ms)`);
    return updated;
  }

  async stop(pluginId: PluginId): Promise<PluginDescriptor> {
    const now = Date.now();
    const descriptor = this.registry.resolve(pluginId);
    this.lifecycle.assertCanTransition(descriptor.status, 'stopped');

    await this.hookRegistry.executeBefore(`plugin:stop`, pluginId);

    const updated = this.lifecycle.transition(descriptor, 'stopped');
    this.registry.update(pluginId, updated);

    await this.eventBridge.publishStopped(pluginId);

    await this.hookRegistry.executeAfter(`plugin:stop`, updated, pluginId);

    this.contexts.delete(pluginId);

    const duration = Date.now() - now;
    this.metrics.recordLifecycleTransition(pluginId, 'stop', duration);

    this.logger.log(`Stopped plugin: ${pluginId} (${duration}ms)`);
    return updated;
  }

  async reload(pluginId: PluginId, services?: Record<string, unknown>): Promise<PluginDescriptor> {
    const now = Date.now();
    const descriptor = this.registry.resolve(pluginId);
    this.lifecycle.assertCanTransition(descriptor.status, 'reloaded');

    await this.hookRegistry.executeBefore(`plugin:reload`, pluginId);

    const reloaded = this.lifecycle.transition(descriptor, 'reloaded');
    this.registry.update(pluginId, reloaded);

    await this.eventBridge.publishReloaded(pluginId);

    await this.hookRegistry.executeAfter(`plugin:reload`, reloaded, pluginId);

    const duration = Date.now() - now;
    this.metrics.recordLifecycleTransition(pluginId, 'reload', duration);

    this.logger.log(`Reloaded plugin: ${pluginId} (${duration}ms)`);

    if (this.options.autoStart !== false) {
      return this.start(pluginId, services);
    }

    return reloaded;
  }

  async disable(pluginId: PluginId): Promise<PluginDescriptor> {
    const descriptor = this.registry.resolve(pluginId);
    this.lifecycle.assertCanTransition(descriptor.status, 'disabled');

    if (descriptor.status === 'started') {
      await this.stop(pluginId);
    }

    const updated = this.lifecycle.transition(this.registry.resolve(pluginId), 'disabled');
    this.registry.update(pluginId, updated);

    this.logger.log(`Disabled plugin: ${pluginId}`);
    return updated;
  }

  async unload(pluginId: PluginId): Promise<PluginDescriptor> {
    const descriptor = this.registry.resolve(pluginId);

    if (descriptor.status === 'started') {
      await this.stop(pluginId);
    }

    this.lifecycle.assertCanTransition(this.registry.resolve(pluginId).status, 'unloaded');

    this.hookRegistry.unregisterAll(pluginId);
    this.capabilityRegistry.unregister(pluginId);
    this.permissionManager.unregister(pluginId);
    this.configurationService.delete(pluginId);
    this.sandbox.release(pluginId);
    this.contexts.delete(pluginId);
    this.metrics.removePlugin(pluginId);

    const updated = this.lifecycle.transition(this.registry.resolve(pluginId), 'unloaded');
    this.registry.update(pluginId, updated);

    this.logger.log(`Unloaded plugin: ${pluginId}`);
    return updated;
  }

  async destroy(pluginId: PluginId): Promise<void> {
    const descriptor = this.registry.resolve(pluginId);

    if (descriptor.status === 'started') {
      await this.stop(pluginId);
    }

    this.hookRegistry.unregisterAll(pluginId);
    this.capabilityRegistry.unregister(pluginId);
    this.permissionManager.unregister(pluginId);
    this.configurationService.delete(pluginId);
    this.sandbox.release(pluginId);
    this.contexts.delete(pluginId);
    this.metrics.removePlugin(pluginId);

    this.registry.unregister(pluginId);

    this.logger.log(`Destroyed plugin: ${pluginId}`);
  }

  async loadAndStart(manifest: PluginManifest, services?: Record<string, unknown>): Promise<PluginDescriptor> {
    await this.discover(manifest);
    await this.load(manifest.id);
    await this.initialize(manifest.id);
    return this.start(manifest.id, services);
  }

  getContext(pluginId: PluginId): PluginContext | undefined {
    return this.contexts.get(pluginId);
  }

  getDescriptor(pluginId: PluginId): PluginDescriptor {
    return this.registry.resolve(pluginId);
  }

  listDescriptors(): PluginDescriptor[] {
    return this.registry.list();
  }

  getStatistics(): PluginStatistics {
    return this.statisticsService.getStatistics();
  }

  getDetailedStatistics(): ReturnType<PluginStatisticsService['getDetailedStatistics']> {
    return this.statisticsService.getDetailedStatistics();
  }

  health() {
    return this.healthService.check();
  }

  async startAll(services?: Record<string, unknown>): Promise<PluginDescriptor[]> {
    const descriptors = this.registry.list();
    const started: PluginDescriptor[] = [];

    for (const d of descriptors) {
      if (this.lifecycle.canBeStarted(d.status)) {
        const started_d = await this.start(d.manifest.id, services);
        started.push(started_d);
      }
    }

    return started;
  }

  async stopAll(): Promise<void> {
    const descriptors = this.registry.list();
    for (const d of descriptors) {
      if (this.lifecycle.isActive(d.status)) {
        await this.stop(d.manifest.id);
      }
    }
  }

  getStatus(pluginId: PluginId): PluginStatus {
    return this.registry.resolve(pluginId).status;
  }
}
