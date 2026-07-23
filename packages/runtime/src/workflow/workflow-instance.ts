import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { WorkflowInstance, WorkflowStatus, HistoryEntry, WorkflowEventType } from './types.js';

@Injectable()
export class WorkflowInstanceManager {
  private readonly logger = new Logger(WorkflowInstanceManager.name);
  private readonly instances = new Map<string, WorkflowInstance>();

  create(workflowName: string, version: string, initialContext: Record<string, unknown> = {}): WorkflowInstance {
    const instance: WorkflowInstance = {
      id: uuid(),
      workflowName,
      version,
      status: 'Created',
      currentStepId: null,
      context: { ...initialContext },
      history: [],
      startedAt: null,
      completedAt: null,
      updatedAt: new Date(),
      error: null,
      retryCount: 0,
      checkpoint: null,
    };
    this.instances.set(instance.id, instance);
    return instance;
  }

  get(id: string): WorkflowInstance | undefined {
    return this.instances.get(id);
  }

  updateStatus(id: string, status: WorkflowStatus): void {
    const instance = this.instances.get(id);
    if (!instance) return;
    instance.status = status;
    instance.updatedAt = new Date();
    if (status === 'Running' && !instance.startedAt) {
      instance.startedAt = new Date();
    }
    if (['Completed', 'Failed', 'Cancelled', 'RolledBack'].includes(status)) {
      instance.completedAt = new Date();
    }
  }

  updateStep(id: string, stepId: string | null): void {
    const instance = this.instances.get(id);
    if (!instance) return;
    instance.currentStepId = stepId;
    instance.updatedAt = new Date();
  }

  setError(id: string, error: string): void {
    const instance = this.instances.get(id);
    if (!instance) return;
    instance.error = error;
    instance.updatedAt = new Date();
  }

  incrementRetry(id: string): void {
    const instance = this.instances.get(id);
    if (!instance) return;
    instance.retryCount++;
    instance.updatedAt = new Date();
  }

  setCheckpoint(id: string, checkpoint: string): void {
    const instance = this.instances.get(id);
    if (!instance) return;
    instance.checkpoint = checkpoint;
    instance.updatedAt = new Date();
  }

  addHistory(id: string, entry: HistoryEntry): void {
    const instance = this.instances.get(id);
    if (!instance) return;
    instance.history.push(entry);
  }

  getAll(): WorkflowInstance[] {
    return Array.from(this.instances.values());
  }

  getByStatus(status: WorkflowStatus): WorkflowInstance[] {
    return this.getAll().filter(i => i.status === status);
  }

  getActive(): WorkflowInstance[] {
    return this.getAll().filter(i =>
      ['Ready', 'Running', 'Paused', 'Waiting', 'Retrying'].includes(i.status),
    );
  }

  delete(id: string): boolean {
    return this.instances.delete(id);
  }

  clear(): void {
    this.instances.clear();
  }

  count(): number {
    return this.instances.size;
  }

  createHistoryEntry(
    workflowId: string,
    stepId: string | null,
    eventType: WorkflowEventType,
    status: string,
    data: Record<string, unknown> = {},
    durationMs: number | null = null,
  ): HistoryEntry {
    return {
      id: uuid(),
      workflowId,
      stepId,
      eventType,
      status,
      data,
      timestamp: new Date(),
      durationMs,
    };
  }
}
