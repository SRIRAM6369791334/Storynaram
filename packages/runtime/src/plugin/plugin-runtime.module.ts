import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { PLUGIN_RUNTIME_OPTIONS } from './tokens.js';
import type { PluginRuntimeOptions } from './types.js';
import { PluginRuntimeService } from './plugin-runtime.service.js';
import { PluginManager } from './plugin-manager.js';
import { PluginRegistry } from './plugin-registry.js';
import { PluginLoader } from './plugin-loader.js';
import { PluginLifecycle } from './plugin-lifecycle.js';
import { PluginDependencyResolver } from './plugin-dependency-resolver.js';
import { PluginCapabilityRegistry } from './plugin-capability-registry.js';
import { PluginPermissionManager } from './plugin-permission-manager.js';
import { PluginConfigurationService } from './plugin-configuration.js';
import { PluginHookRegistry } from './plugin-hook-registry.js';
import { PluginEventBridge } from './plugin-event-bridge.js';
import { PluginContextFactory } from './plugin-context.js';
import { PluginSandbox } from './plugin-sandbox.js';
import { PluginHealthService } from './plugin-health.service.js';
import { PluginMetricsCollector } from './plugin-metrics.js';
import { PluginStatisticsService } from './plugin-statistics.js';
import { PluginDescriptorFactory } from './plugin-descriptor.js';
import { PluginManifestService } from './plugin-manifest.js';

const DEFAULT_OPTIONS: PluginRuntimeOptions = {
  autoStart: true,
  enableHooks: true,
  enableEventBridge: true,
  enablePermissions: true,
  enableMetrics: true,
  enableHealthChecks: true,
  healthCheckIntervalMs: 30000,
};

@Global()
@Module({})
export class PluginRuntimeModule {
  static forRoot(options?: PluginRuntimeOptions): DynamicModule {
    const resolvedOptions: PluginRuntimeOptions = { ...DEFAULT_OPTIONS, ...options };

    const providers: Provider[] = [
      { provide: PLUGIN_RUNTIME_OPTIONS, useValue: resolvedOptions },
      PluginRuntimeService,
      PluginManager,
      PluginRegistry,
      PluginLoader,
      PluginLifecycle,
      PluginDependencyResolver,
      PluginCapabilityRegistry,
      PluginPermissionManager,
      PluginConfigurationService,
      PluginHookRegistry,
      PluginEventBridge,
      PluginContextFactory,
      PluginSandbox,
      PluginHealthService,
      PluginMetricsCollector,
      PluginStatisticsService,
      PluginDescriptorFactory,
      PluginManifestService,
    ];

    return {
      module: PluginRuntimeModule,
      global: true,
      providers,
      exports: [
        PluginRuntimeService,
        PluginManager,
        PluginRegistry,
        PluginLoader,
        PluginLifecycle,
        PluginDependencyResolver,
        PluginCapabilityRegistry,
        PluginPermissionManager,
        PluginConfigurationService,
        PluginHookRegistry,
        PluginEventBridge,
        PluginContextFactory,
        PluginSandbox,
        PluginHealthService,
        PluginMetricsCollector,
        PluginStatisticsService,
        PluginDescriptorFactory,
        PluginManifestService,
      ],
    };
  }

  static forFeature(): DynamicModule {
    const providers: Provider[] = [
      PluginRuntimeService,
      PluginManager,
      PluginRegistry,
      PluginLoader,
      PluginLifecycle,
      PluginDependencyResolver,
      PluginCapabilityRegistry,
      PluginPermissionManager,
      PluginConfigurationService,
      PluginHookRegistry,
      PluginEventBridge,
      PluginContextFactory,
      PluginSandbox,
      PluginHealthService,
      PluginMetricsCollector,
      PluginStatisticsService,
      PluginDescriptorFactory,
      PluginManifestService,
    ];

    return {
      module: PluginRuntimeModule,
      providers,
      exports: providers,
    };
  }
}
