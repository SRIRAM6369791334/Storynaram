import { Injectable } from '@nestjs/common';
import type { PluginManifest } from './plugin-manifest.type';

@Injectable()
export abstract class PluginApi {
  abstract onLoad(): Promise<void>;
  abstract onActivate(): Promise<void>;
  abstract onDeactivate(): Promise<void>;
  abstract getManifest(): PluginManifest;
}
