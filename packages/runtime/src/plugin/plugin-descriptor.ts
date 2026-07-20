import { Injectable } from '@nestjs/common';
import type { PluginManifest, PluginDescriptor, PluginStatus } from './types';

@Injectable()
export class PluginDescriptorFactory {
  create(manifest: PluginManifest, status: PluginStatus = 'discovered'): PluginDescriptor {
    return {
      manifest,
      status,
      errorCount: 0,
      hooks: 0,
      metadata: {},
    };
  }

  transition(descriptor: PluginDescriptor, newStatus: PluginStatus): PluginDescriptor {
    const now = new Date();
    const updates: Partial<PluginDescriptor> = { status: newStatus };

    if (newStatus === 'started') {
      updates.startedAt = now;
      updates.stoppedAt = undefined;
    } else if (newStatus === 'stopped' || newStatus === 'disabled') {
      updates.stoppedAt = now;
    }

    return { ...descriptor, ...updates };
  }

  recordError(descriptor: PluginDescriptor, error: string): PluginDescriptor {
    return {
      ...descriptor,
      errorCount: descriptor.errorCount + 1,
      lastError: error,
    };
  }
}
