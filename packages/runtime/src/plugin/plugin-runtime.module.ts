import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { PLUGIN_RUNTIME_OPTIONS } from './tokens';
import type { PluginRuntimeOptions } from './types';
import { PluginRuntimeService } from './plugin-runtime.service';
import { PluginManager } from './plugin-manager';
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
