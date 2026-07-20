import { Injectable, Logger } from '@nestjs/common';
import type { PluginId } from '@storynaram/runtime';
import { RedisConnection } from '../connection/redis-connection';

@Injectable()
export class PluginCacheAdapter {
  private readonly logger = new Logger(PluginCacheAdapter.name);
  private readonly keyPrefix: string;

  constructor(
    private readonly connection: RedisConnection,
    keyPrefix?: string,
  ) {
    this.keyPrefix = keyPrefix ?? 'plugin';
  }

  async saveConfiguration(pluginId: PluginId, config: Record<string, unknown>): Promise<void> {
    const key = this.buildConfigKey(pluginId);
    try {
      const client = this.connection.getNativeClient();
      await client.hset(key, {
        pluginId,
        config: JSON.stringify(config),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      this.logger.error(`Failed to save plugin config: ${(err as Error).message}`);
    }
  }

  async getConfiguration(pluginId: PluginId): Promise<Record<string, unknown> | undefined> {
    const key = this.buildConfigKey(pluginId);
    try {
      const client = this.connection.getNativeClient();
      const data = await client.hget(key, 'config');
      if (!data) return undefined;
      return JSON.parse(data);
    } catch {
      return undefined;
    }
  }

  async saveState(
    pluginId: PluginId,
    state: { status: string; stateData: Record<string, unknown>; errorCount?: number; lastError?: string; startedAt?: Date; stoppedAt?: Date },
  ): Promise<void> {
    const key = this.buildStateKey(pluginId);
    try {
      const client = this.connection.getNativeClient();
      await client.hset(key, {
        pluginId,
        status: state.status,
        state: JSON.stringify(state.stateData),
        errorCount: String(state.errorCount ?? 0),
        lastError: state.lastError ?? '',
        startedAt: state.startedAt?.toISOString() ?? '',
        stoppedAt: state.stoppedAt?.toISOString() ?? '',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      this.logger.error(`Failed to save plugin state: ${(err as Error).message}`);
    }
  }

  async getState(pluginId: PluginId): Promise<Record<string, unknown> | undefined> {
    const key = this.buildStateKey(pluginId);
    try {
      const client = this.connection.getNativeClient();
      const data = await client.hgetall(key);
      if (!data || Object.keys(data).length === 0) return undefined;
      return {
        ...data,
        state: data['state'] ? JSON.parse(data['state']) : {},
        errorCount: Number(data['errorCount'] ?? 0),
        startedAt: data['startedAt'] ? new Date(data['startedAt']) : undefined,
        stoppedAt: data['stoppedAt'] ? new Date(data['stoppedAt']) : undefined,
        updatedAt: new Date(data['updatedAt']!),
      };
    } catch {
      return undefined;
    }
  }

  async recordMetric(pluginId: PluginId, metricName: string, value: number): Promise<void> {
    const key = this.buildMetricKey(pluginId);
    const entryId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    try {
      const client = this.connection.getNativeClient();
      await client.hset(`${key}:${entryId}`, {
        pluginId,
        metricName,
        metricValue: String(value),
        recordedAt: new Date().toISOString(),
      });
      await client.zadd(key, Date.now(), entryId);
      await client.zremrangebyrank(key, 0, -1001);
    } catch (err) {
      this.logger.error(`Failed to record plugin metric: ${(err as Error).message}`);
    }
  }

  async getMetrics(
    pluginId: PluginId,
    metricName?: string,
    limit = 100,
  ): Promise<Array<{ name: string; value: number; recordedAt: Date }>> {
    const key = this.buildMetricKey(pluginId);
    try {
      const client = this.connection.getNativeClient();
      const entryIds = await client.zrevrange(key, 0, limit - 1);
      const results: Array<{ name: string; value: number; recordedAt: Date }> = [];
      for (const entryId of entryIds) {
        const data = await client.hgetall(`${key}:${entryId}`);
        if (data && Object.keys(data).length > 0) {
          if (metricName && data['metricName'] !== metricName) continue;
          results.push({
            name: data['metricName']!,
            value: Number(data['metricValue']!),
            recordedAt: new Date(data['recordedAt']!),
          });
        }
      }
      return results;
    } catch {
      return [];
    }
  }

  async deletePluginData(pluginId: PluginId): Promise<void> {
    try {
      const client = this.connection.getNativeClient();
      await client.del(this.buildConfigKey(pluginId));
      await client.del(this.buildStateKey(pluginId));
      const metricKey = this.buildMetricKey(pluginId);
      const entryIds = await client.zrange(metricKey, 0, -1);
      const pipeline = client.pipeline();
      for (const entryId of entryIds) {
        pipeline.del(`${metricKey}:${entryId}`);
      }
      pipeline.del(metricKey);
      await pipeline.exec();
    } catch (err) {
      this.logger.error(`Failed to delete plugin data: ${(err as Error).message}`);
    }
  }

  private buildConfigKey(pluginId: string): string { return `${this.keyPrefix}:config:${pluginId}`; }
  private buildStateKey(pluginId: string): string { return `${this.keyPrefix}:state:${pluginId}`; }
  private buildMetricKey(pluginId: string): string { return `${this.keyPrefix}:metrics:${pluginId}`; }
}
