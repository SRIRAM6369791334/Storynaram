import { Injectable, Logger } from '@nestjs/common';
import type { WorkflowInstance, CheckpointData, WorkflowStatus } from '@storynaram/runtime';
import type { HistoryEntry } from '../internal/runtime-types';
import { RedisConnection } from '../connection/redis-connection';

@Injectable()
export class WorkflowCacheAdapter {
  private readonly logger = new Logger(WorkflowCacheAdapter.name);
  private readonly keyPrefix: string;

  constructor(
    private readonly connection: RedisConnection,
    keyPrefix?: string,
  ) {
    this.keyPrefix = keyPrefix ?? 'workflow';
  }

  async saveInstance(instance: WorkflowInstance): Promise<void> {
    const key = this.buildInstanceKey(instance.id);
    try {
      const client = this.connection.getNativeClient();
      await client.hset(key, {
        id: instance.id,
        workflowName: instance.workflowName,
        version: instance.version,
        status: instance.status,
        currentStepId: instance.currentStepId ?? '',
        context: JSON.stringify(instance.context),
        startedAt: instance.startedAt?.toISOString() ?? '',
        completedAt: instance.completedAt?.toISOString() ?? '',
        updatedAt: new Date().toISOString(),
        error: instance.error ?? '',
        retryCount: String(instance.retryCount),
        checkpoint: instance.checkpoint ? JSON.stringify(instance.checkpoint) : '',
      });
      await this.addToIndex(instance);
    } catch (err) {
      this.logger.error(`Failed to save workflow instance: ${(err as Error).message}`);
    }
  }

  async getInstance(id: string): Promise<WorkflowInstance | undefined> {
    const key = this.buildInstanceKey(id);
    try {
      const client = this.connection.getNativeClient();
      const data = await client.hgetall(key);
      if (!data || Object.keys(data).length === 0) return undefined;
      return this.hashToInstance(data);
    } catch {
      return undefined;
    }
  }

  async findInstances(filter: { status?: WorkflowStatus; workflowName?: string; limit?: number; offset?: number }): Promise<WorkflowInstance[]> {
    const indexKey = this.buildIndexKey();
    const limit = filter.limit ?? 100;
    const offset = filter.offset ?? 0;
    try {
      const client = this.connection.getNativeClient();
      const instanceIds = await client.zrevrange(indexKey, offset, offset + limit - 1);
      const instances: WorkflowInstance[] = [];
      for (const id of instanceIds) {
        const instance = await this.getInstance(id);
        if (instance) {
          if (filter.status && instance.status !== filter.status) continue;
          if (filter.workflowName && instance.workflowName !== filter.workflowName) continue;
          instances.push(instance);
        }
      }
      return instances;
    } catch {
      return [];
    }
  }

  async saveHistory(entry: HistoryEntry): Promise<void> {
    const key = this.buildHistoryKey(entry.workflowId);
    const historyId = entry.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    try {
      const client = this.connection.getNativeClient();
      await client.hset(`${key}:${historyId}`, {
        id: historyId,
        workflowId: entry.workflowId,
        stepId: entry.stepId ?? '',
        eventType: entry.eventType,
        status: entry.status,
        data: JSON.stringify(entry.data),
        timestamp: entry.timestamp.toISOString(),
        durationMs: String(entry.durationMs ?? ''),
      });
      await client.zadd(key, entry.timestamp.getTime(), historyId);
    } catch (err) {
      this.logger.error(`Failed to save history entry: ${(err as Error).message}`);
    }
  }

  async getHistory(workflowId: string, limit = 100): Promise<HistoryEntry[]> {
    const key = this.buildHistoryKey(workflowId);
    try {
      const client = this.connection.getNativeClient();
      const historyIds = await client.zrange(key, 0, limit - 1);
      const entries: HistoryEntry[] = [];
      for (const hid of historyIds) {
        const data = await client.hgetall(`${key}:${hid}`);
        if (data && Object.keys(data).length > 0) {
          entries.push(this.hashToHistory(data));
        }
      }
      return entries;
    } catch {
      return [];
    }
  }

  async saveCheckpoint(checkpoint: CheckpointData): Promise<void> {
    const key = this.buildCheckpointKey(checkpoint.workflowId, checkpoint.stepId);
    try {
      const client = this.connection.getNativeClient();
      await client.hset(key, {
        workflowId: checkpoint.workflowId,
        stepId: checkpoint.stepId,
        context: JSON.stringify(checkpoint.context),
        timestamp: checkpoint.timestamp.toISOString(),
        version: checkpoint.version,
      });
    } catch (err) {
      this.logger.error(`Failed to save checkpoint: ${(err as Error).message}`);
    }
  }

  async getCheckpoint(workflowId: string, stepId: string): Promise<CheckpointData | undefined> {
    const key = this.buildCheckpointKey(workflowId, stepId);
    try {
      const client = this.connection.getNativeClient();
      const data = await client.hgetall(key);
      if (!data || Object.keys(data).length === 0) return undefined;
      return {
        workflowId: data['workflowId']!,
        stepId: data['stepId']!,
        context: JSON.parse(data['context']!),
        timestamp: new Date(data['timestamp']!),
        version: data['version']!,
      };
    } catch {
      return undefined;
    }
  }

  async deleteCheckpoint(workflowId: string, stepId: string): Promise<void> {
    const key = this.buildCheckpointKey(workflowId, stepId);
    try {
      const client = this.connection.getNativeClient();
      await client.del(key);
    } catch (err) {
      this.logger.error(`Failed to delete checkpoint: ${(err as Error).message}`);
    }
  }

  async deleteInstance(id: string): Promise<void> {
    const key = this.buildInstanceKey(id);
    try {
      const client = this.connection.getNativeClient();
      await client.del(key);
      await this.removeFromIndex(id);
    } catch (err) {
      this.logger.error(`Failed to delete workflow instance: ${(err as Error).message}`);
    }
  }

  async getInstanceCount(): Promise<number> {
    const indexKey = this.buildIndexKey();
    try {
      const client = this.connection.getNativeClient();
      return client.zcard(indexKey);
    } catch {
      return 0;
    }
  }

  private async addToIndex(instance: WorkflowInstance): Promise<void> {
    const indexKey = this.buildIndexKey();
    const client = this.connection.getNativeClient();
    const score = instance.updatedAt?.getTime() ?? Date.now();
    await client.zadd(indexKey, score, instance.id);
  }

  private async removeFromIndex(id: string): Promise<void> {
    const indexKey = this.buildIndexKey();
    const client = this.connection.getNativeClient();
    await client.zrem(indexKey, id);
  }

  private hashToInstance(data: Record<string, string>): WorkflowInstance {
    return {
      id: data['id']!,
      workflowName: data['workflowName']!,
      version: data['version']!,
      status: data['status']! as WorkflowStatus,
      currentStepId: data['currentStepId'] || null,
      context: JSON.parse(data['context'] ?? '{}'),
      startedAt: data['startedAt'] ? new Date(data['startedAt']) : null,
      completedAt: data['completedAt'] ? new Date(data['completedAt']) : null,
      updatedAt: new Date(data['updatedAt']!),
      error: data['error'] || null,
      retryCount: Number(data['retryCount'] ?? 0),
      checkpoint: data['checkpoint'] ? JSON.parse(data['checkpoint']) : null,
    } as WorkflowInstance;
  }

  private hashToHistory(data: Record<string, string>): HistoryEntry {
    return {
      id: data['id']!,
      workflowId: data['workflowId']!,
      stepId: data['stepId'] || null,
      eventType: data['eventType']! as HistoryEntry['eventType'],
      status: data['status']!,
      data: JSON.parse(data['data'] ?? '{}'),
      timestamp: new Date(data['timestamp']!),
      durationMs: data['durationMs'] ? Number(data['durationMs']) : null,
    } as HistoryEntry;
  }

  private buildInstanceKey(id: string): string {
    return `${this.keyPrefix}:instance:${id}`;
  }

  private buildHistoryKey(workflowId: string): string {
    return `${this.keyPrefix}:history:${workflowId}`;
  }

  private buildCheckpointKey(workflowId: string, stepId: string): string {
    return `${this.keyPrefix}:checkpoint:${workflowId}:${stepId}`;
  }

  private buildIndexKey(): string {
    return `${this.keyPrefix}:index`;
  }
}
