import { Injectable } from '@nestjs/common';

@Injectable()
export class WorkflowContext {
  private readonly store = new Map<string, Record<string, unknown>>();

  set(workflowId: string, key: string, value: unknown): void {
    const data = this.store.get(workflowId) ?? {};
    data[key] = value;
    this.store.set(workflowId, data);
  }

  get(workflowId: string, key: string): unknown | undefined {
    const data = this.store.get(workflowId);
    if (!data) return undefined;
    return data[key];
  }

  getAll(workflowId: string): Record<string, unknown> {
    return { ...(this.store.get(workflowId) ?? {}) };
  }

  setAll(workflowId: string, data: Record<string, unknown>): void {
    this.store.set(workflowId, { ...data });
  }

  merge(workflowId: string, data: Record<string, unknown>): void {
    const existing = this.store.get(workflowId) ?? {};
    this.store.set(workflowId, { ...existing, ...data });
  }

  delete(workflowId: string, key: string): void {
    const data = this.store.get(workflowId);
    if (data) {
      delete data[key];
    }
  }

  clear(workflowId: string): void {
    this.store.delete(workflowId);
  }

  has(workflowId: string): boolean {
    return this.store.has(workflowId);
  }
}
