import { Injectable, Logger } from '@nestjs/common';
import type { PluginDescriptor, PluginContext, PluginManifest } from './types.js';
import type { PluginConfigurationService } from './plugin-configuration.js';
import type { PluginCapabilityRegistry } from './plugin-capability-registry.js';
import type { PluginPermissionManager } from './plugin-permission-manager.js';
import type { PluginHookRegistry } from './plugin-hook-registry.js';
import type { PluginEventBridge } from './plugin-event-bridge.js';

@Injectable()
export class PluginContextFactory {
  private readonly logger = new Logger(PluginContextFactory.name);

  constructor(
    private readonly configurationService: PluginConfigurationService,
    private readonly capabilityRegistry: PluginCapabilityRegistry,
    private readonly permissionManager: PluginPermissionManager,
    private readonly hookRegistry: PluginHookRegistry,
    private readonly eventBridge: PluginEventBridge,
  ) {}

  createContext(descriptor: PluginDescriptor, services: Record<string, unknown>): PluginContext {
    const manifest = descriptor.manifest;
    const pluginId = manifest.id;

    return {
      pluginId,
      manifest,
      config: this.configurationService.get(pluginId),
      logger: {
        info: (msg: string, ...args: unknown[]) => this.logger.log(`[${pluginId}] ${msg}`, ...args),
        warn: (msg: string, ...args: unknown[]) => this.logger.warn(`[${pluginId}] ${msg}`, ...args),
        error: (msg: string, ...args: unknown[]) => this.logger.error(`[${pluginId}] ${msg}`, ...args),
        debug: (msg: string, ...args: unknown[]) => this.logger.debug(`[${pluginId}] ${msg}`, ...args),
      },
      services,
      hooks: {
        register: (hookName: string, handler: Parameters<typeof this.hookRegistry.register>[2], options) => {
          this.hookRegistry.register(pluginId, hookName, handler, options);
        },
        unregister: (hookName: string) => {
          this.hookRegistry.unregister(pluginId, hookName);
        },
      },
      events: {
        publish: (eventName: string, payload: Record<string, unknown>) => {
          this.eventBridge.publishFromPlugin(pluginId, eventName, payload).catch(() => {});
        },
        subscribe: (eventName: string, handler: (payload: Record<string, unknown>) => void) => {
          this.eventBridge.subscribe(eventName, pluginId, handler);
        },
      },
    };
  }
}
