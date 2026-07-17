import { Injectable } from '@nestjs/common';
import type { PluginManifest } from './plugin-manifest.type';
import { PluginLifecycle } from './plugin-lifecycle.enum';
import type { PluginApi } from './plugin-api.abstract';

@Injectable()
export abstract class PluginRegistry {
  abstract register(plugin: PluginApi): Promise<void>;
  abstract unregister(pluginId: string): Promise<void>;
  abstract getPlugin(pluginId: string): PluginApi | undefined;
  abstract getManifests(): PluginManifest[];
  abstract getStatus(pluginId: string): PluginLifecycle | undefined;
}
