import { Injectable, Logger } from '@nestjs/common';
import type { PluginStatus, PluginDescriptor } from './types';
import { PluginError } from './errors';

const VALID_TRANSITIONS: Record<PluginStatus, PluginStatus[]> = {
  discovered: ['loaded', 'destroyed'],
  loaded: ['initialized', 'destroyed'],
  initialized: ['started', 'unloaded', 'destroyed'],
  started: ['stopped', 'disabled', 'reloaded', 'destroyed'],
  stopped: ['started', 'unloaded', 'disabled', 'destroyed'],
  reloaded: ['started', 'stopped', 'disabled', 'destroyed'],
  disabled: ['started', 'unloaded', 'destroyed'],
  unloaded: ['loaded', 'destroyed'],
  destroyed: [],
};

@Injectable()
export class PluginLifecycle {
  private readonly logger = new Logger(PluginLifecycle.name);

  canTransition(from: PluginStatus, to: PluginStatus): boolean {
    const allowed = VALID_TRANSITIONS[from];
    if (!allowed) return false;
    return allowed.includes(to);
  }

  assertCanTransition(from: PluginStatus, to: PluginStatus): void {
    if (!this.canTransition(from, to)) {
      throw new PluginError(
        `Cannot transition plugin from "${from}" to "${to}"`,
        'INVALID_TRANSITION',
      );
    }
  }

  transition(descriptor: PluginDescriptor, to: PluginStatus): PluginDescriptor {
    this.assertCanTransition(descriptor.status, to);
    const now = new Date();
    const updates: Partial<PluginDescriptor> = { status: to };

    if (to === 'started') {
      updates.startedAt = now;
      updates.stoppedAt = undefined;
    } else if (to === 'stopped' || to === 'disabled') {
      updates.stoppedAt = now;
    }

    const updated: PluginDescriptor = { ...descriptor, ...updates };
    this.logger.log(`Plugin "${descriptor.manifest.id}" transitioned: ${descriptor.status} -> ${to}`);
    return updated;
  }

  recordError(descriptor: PluginDescriptor, error: string): PluginDescriptor {
    return {
      ...descriptor,
      errorCount: descriptor.errorCount + 1,
      lastError: error,
    };
  }

  isActive(status: PluginStatus): boolean {
    return status === 'started';
  }

  isStopped(status: PluginStatus): boolean {
    return status === 'stopped' || status === 'disabled';
  }

  isTerminal(status: PluginStatus): boolean {
    return status === 'destroyed';
  }

  canBeLoaded(status: PluginStatus): boolean {
    return status === 'discovered';
  }

  canBeStarted(status: PluginStatus): boolean {
    return status === 'initialized';
  }
}
