import { Injectable, Logger } from '@nestjs/common';
import type { HistoryEntry, CheckpointData } from './types.js';

@Injectable()
export class WorkflowHistoryService {
  private readonly logger = new Logger(WorkflowHistoryService.name);
  private readonly history = new Map<string, HistoryEntry[]>();
  private readonly checkpoints = new Map<string, CheckpointData>();
  private maxEntriesPerWorkflow = 1000;

  async record(entry: HistoryEntry): Promise<void> {
    const entries = this.history.get(entry.workflowId) ?? [];
    entries.push(entry);
    if (entries.length > this.maxEntriesPerWorkflow) {
      entries.shift();
    }
    this.history.set(entry.workflowId, entries);
  }

  async getHistory(workflowId: string): Promise<HistoryEntry[]> {
    return [...(this.history.get(workflowId) ?? [])];
  }

  async getWorkflowHistory(workflowId: string, limit?: number): Promise<HistoryEntry[]> {
    const entries = this.history.get(workflowId) ?? [];
    return limit ? entries.slice(-limit) : entries;
  }

  async getStepHistory(workflowId: string, stepId: string): Promise<HistoryEntry[]> {
    return (this.history.get(workflowId) ?? []).filter(e => e.stepId === stepId);
  }

  async getEventsByType(workflowId: string, eventType: string): Promise<HistoryEntry[]> {
    return (this.history.get(workflowId) ?? []).filter(e => e.eventType === eventType);
  }

  async saveCheckpoint(data: CheckpointData): Promise<void> {
    this.checkpoints.set(data.workflowId, data);
  }

  async getCheckpoint(workflowId: string): Promise<CheckpointData | undefined> {
    return this.checkpoints.get(workflowId);
  }

  async hasCheckpoint(workflowId: string): Promise<boolean> {
    return this.checkpoints.has(workflowId);
  }

  async deleteCheckpoint(workflowId: string): Promise<void> {
    this.checkpoints.delete(workflowId);
  }

  async deleteHistory(workflowId: string): Promise<void> {
    this.history.delete(workflowId);
  }

  async clear(): Promise<void> {
    this.history.clear();
    this.checkpoints.clear();
  }

  setMaxEntries(max: number): void {
    this.maxEntriesPerWorkflow = max;
  }

  getHistoryCount(): number {
    let count = 0;
    for (const entries of this.history.values()) {
      count += entries.length;
    }
    return count;
  }

  getCheckpointCount(): number {
    return this.checkpoints.size;
  }
}
