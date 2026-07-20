import { Injectable, Logger } from '@nestjs/common';
import type { PluginManifest, PluginDescriptor, PluginId } from './types';
import { PluginLoadError } from './errors';
import { PluginManifestService } from './plugin-manifest';
import { PluginDescriptorFactory } from './plugin-descriptor';
import { PluginDependencyResolver } from './plugin-dependency-resolver';

@Injectable()
export class PluginLoader {
  private readonly logger = new Logger(PluginLoader.name);
  private readonly loadedManifests: Map<PluginId, PluginManifest> = new Map();

  constructor(
    private readonly manifestService: PluginManifestService,
    private readonly descriptorFactory: PluginDescriptorFactory,
    private readonly dependencyResolver: PluginDependencyResolver,
  ) {}

  loadManifest(manifest: PluginManifest): PluginDescriptor {
    this.manifestService.validate(manifest);
    const descriptor = this.descriptorFactory.create(manifest, 'loaded');
    this.loadedManifests.set(manifest.id, manifest);
    this.logger.log(`Loaded plugin manifest: ${manifest.id} v${manifest.version}`);
    return descriptor;
  }

  loadManifests(manifests: PluginManifest[]): PluginDescriptor[] {
    const valid: PluginManifest[] = [];

    for (const manifest of manifests) {
      try {
        this.manifestService.validate(manifest);
        valid.push(manifest);
      } catch (error) {
        this.logger.error(`Invalid manifest for plugin "${manifest.id}": ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    }

    const resolved = this.dependencyResolver.resolve(valid);
    const descriptors = resolved.map(m => {
      const descriptor = this.descriptorFactory.create(m, 'loaded');
      this.loadedManifests.set(m.id, m);
      this.logger.log(`Loaded plugin manifest: ${m.id} v${m.version}`);
      return descriptor;
    });

    return descriptors;
  }

  async loadFromManifest(manifest: PluginManifest): Promise<PluginDescriptor> {
    return this.loadManifest(manifest);
  }

  isLoaded(id: PluginId): boolean {
    return this.loadedManifests.has(id);
  }

  getManifest(id: PluginId): PluginManifest | undefined {
    return this.loadedManifests.get(id);
  }

  clear(): void {
    this.loadedManifests.clear();
  }
}
