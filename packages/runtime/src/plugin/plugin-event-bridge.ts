import { Injectable, Logger, Optional } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { PluginId } from './types';
import type { EventBusPort } from '@storynaram/events';

type EventHandler = (payload: Record<string, unknown>) => void;

@Injectable()
export class PluginEventBridge {
  private readonly logger = new Logger(PluginEventBridge.name);
  private readonly localSubscribers: Map<string, Map<PluginId, EventHandler[]>> = new Map();
  private enabled = true;

  constructor(
    @Optional() private readonly eventBus?: EventBusPort,
  ) {}

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  async publish(eventType: string, pluginId: PluginId, payload: Record<string, unknown>): Promise<void> {
    if (!this.enabled) return;
    const eventId = uuid();
    const timestamp = new Date();

    if (this.eventBus) {
      try {
        await this.eventBus.publish({
          eventId,
          eventType: `plugin.${eventType}`,
          aggregateId: pluginId,
          timestamp,
          payload,
        });
      } catch (error) {
        this.logger.warn(`Failed to publish event "${eventType}" to event bus: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    this.notifyLocal(eventType, payload);
  }

  async publishFromPlugin(pluginId: PluginId, eventName: string, payload: Record<string, unknown>): Promise<void> {
    await this.publish(`plugin.${eventName}`, pluginId, payload);
  }

  async publishLoaded(pluginId: PluginId): Promise<void> {
    await this.publish('PluginLoaded', pluginId, { pluginId });
  }

  async publishStarted(pluginId: PluginId): Promise<void> {
    await this.publish('PluginStarted', pluginId, { pluginId });
  }

  async publishStopped(pluginId: PluginId): Promise<void> {
    await this.publish('PluginStopped', pluginId, { pluginId });
  }

  async publishFailed(pluginId: PluginId, error: string): Promise<void> {
    await this.publish('PluginFailed', pluginId, { pluginId, error });
  }

  async publishReloaded(pluginId: PluginId): Promise<void> {
    await this.publish('PluginReloaded', pluginId, { pluginId });
  }

  subscribe(eventName: string, pluginId: PluginId, handler: EventHandler): void {
    const pluginSubs = this.localSubscribers.get(eventName) ?? new Map();
    const handlers = pluginSubs.get(pluginId) ?? [];
    handlers.push(handler);
    pluginSubs.set(pluginId, handlers);
    this.localSubscribers.set(eventName, pluginSubs);
  }

  unsubscribe(eventName: string, pluginId: PluginId): void {
    const pluginSubs = this.localSubscribers.get(eventName);
    if (!pluginSubs) return;
    pluginSubs.delete(pluginId);
    if (pluginSubs.size === 0) {
      this.localSubscribers.delete(eventName);
    }
  }

  unsubscribeAll(pluginId: PluginId): void {
    for (const [, pluginSubs] of this.localSubscribers.entries()) {
      pluginSubs.delete(pluginId);
    }
  }

  private notifyLocal(eventType: string, payload: Record<string, unknown>): void {
    const pluginSubs = this.localSubscribers.get(eventType);
    if (!pluginSubs) return;

    for (const [, handlers] of pluginSubs.entries()) {
      for (const handler of handlers) {
        try {
          handler(payload);
        } catch (error) {
          this.logger.warn(`Local event handler failed for "${eventType}": ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
  }

  clear(): void {
    this.localSubscribers.clear();
  }
}
