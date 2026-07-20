import { bench, describe } from 'vitest';
import {
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
} from '../src/plugin';
import type { PluginManifest } from '../src/plugin';

function createManager(): PluginManager {
  const registry = new PluginRegistry();
  const manifestService = new PluginManifestService();
  const descriptorFactory = new PluginDescriptorFactory();
  const lifecycle = new PluginLifecycle();
  const dependencyResolver = new PluginDependencyResolver();
  const capabilityRegistry = new PluginCapabilityRegistry();
  const permissionManager = new PluginPermissionManager();
  const configurationService = new PluginConfigurationService();
  const hookRegistry = new PluginHookRegistry();
  const eventBridge = new PluginEventBridge();
  const contextFactory = new PluginContextFactory(configurationService, capabilityRegistry, permissionManager, hookRegistry, eventBridge);
  const sandbox = new PluginSandbox(permissionManager);
  const healthService = new PluginHealthService(registry);
  const metrics = new PluginMetricsCollector();
  const statisticsService = new PluginStatisticsService(registry, hookRegistry, capabilityRegistry, metrics);
  const loader = new PluginLoader(manifestService, descriptorFactory, dependencyResolver);

  return new PluginManager(
    registry,
    loader,
    lifecycle,
    dependencyResolver,
    capabilityRegistry,
    permissionManager,
    configurationService,
    hookRegistry,
    eventBridge,
    contextFactory,
    sandbox,
    healthService,
    metrics,
    statisticsService,
    descriptorFactory,
    manifestService,
  );
}

function makeManifest(id: string, deps?: string[], version = '1.0.0'): PluginManifest {
  return {
    id,
    name: id,
    version,
    dependencies: deps?.map(d => ({ id: d })) ?? [],
  };
}

describe('Plugin Benchmarks', () => {
  bench('100 plugin lifecycle', async () => {
    const manager = createManager();
    const plugins: PluginManifest[] = [];
    for (let i = 0; i < 100; i++) {
      plugins.push(makeManifest(`plugin-${i}`));
    }
    for (const p of plugins) {
      await manager.loadAndStart(p);
    }
  });

  bench('1,000 hooks', async () => {
    const manager = createManager();
    const plugin = makeManifest('hook-bench');
    await manager.loadAndStart(plugin);
    const context = manager.getContext('hook-bench')!;
    for (let i = 0; i < 1000; i++) {
      context.hooks.register(`hook-${i}`, () => 'ok');
    }
  });

  bench('parallel lifecycle', async () => {
    const manager = createManager();
    const promises = [];
    for (let i = 0; i < 50; i++) {
      promises.push(manager.loadAndStart(makeManifest(`parallel-${i}`)));
    }
    await Promise.all(promises);
  });

  bench('dependency resolution', async () => {
    const resolver = new PluginDependencyResolver();
    const manifests: PluginManifest[] = [];
    for (let i = 0; i < 100; i++) {
      const deps = i > 0 ? [`plugin-${i - 1}`] : undefined;
      manifests.push(makeManifest(`plugin-${i}`, deps));
    }
    resolver.resolve(manifests);
  });

  bench('registry statistics', () => {
    const registry = new PluginRegistry();
    for (let i = 0; i < 100; i++) {
      registry.register({
        manifest: makeManifest(`plugin-${i}`),
        status: i % 2 === 0 ? 'started' : 'stopped',
        errorCount: i % 5 === 0 ? 1 : 0,
        hooks: i,
        metadata: {},
      });
    }
    registry.statistics();
  });
});
