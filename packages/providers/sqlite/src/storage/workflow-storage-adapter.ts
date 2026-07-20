import { Injectable, Logger } from '@nestjs/common';
import type { WorkflowInstance, CheckpointData, WorkflowStatus } from '@storynaram/runtime';
import type { HistoryEntry } from '../internal/runtime-types';
import { SQLiteConnection } from '../connection/sqlite-connection';
import { v4 as uuid } from 'uuid';

@Injectable()
export class WorkflowStorageAdapter {
  private readonly logger = new Logger(WorkflowStorageAdapter.name);

  constructor(private readonly connection: SQLiteConnection) {}

  ensureTables(): void {
    this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_workflow_instances" (
        "id" TEXT PRIMARY KEY,
        "workflow_name" TEXT NOT NULL,
        "version" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "current_step_id" TEXT,
        "context" TEXT DEFAULT '{}',
        "started_at" TEXT,
        "completed_at" TEXT,
        "updated_at" TEXT NOT NULL,
        "error" TEXT,
        "retry_count" INTEGER DEFAULT 0,
        "checkpoint" TEXT
      )
    `);
    this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_workflow_history" (
        "id" TEXT PRIMARY KEY,
        "workflow_id" TEXT NOT NULL,
        "step_id" TEXT,
        "event_type" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "data" TEXT DEFAULT '{}',
        "timestamp" TEXT NOT NULL,
        "duration_ms" INTEGER,
        FOREIGN KEY ("workflow_id") REFERENCES "_workflow_instances"("id") ON DELETE CASCADE
      )
    `);
    this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_workflow_checkpoints" (
        "workflow_id" TEXT NOT NULL,
        "step_id" TEXT NOT NULL,
        "context" TEXT NOT NULL DEFAULT '{}',
        "timestamp" TEXT NOT NULL,
        "version" TEXT NOT NULL,
        PRIMARY KEY ("workflow_id", "step_id")
      )
    `);
    this.connection.execute(`
      CREATE INDEX IF NOT EXISTS "idx_wf_history_workflow" ON "_workflow_history" ("workflow_id")
    `);
  }

  saveInstance(instance: WorkflowInstance): void {
    this.connection.execute(`
      INSERT INTO "_workflow_instances" (
        "id", "workflow_name", "version", "status", "current_step_id", "context",
        "started_at", "completed_at", "updated_at", "error", "retry_count", "checkpoint"
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT ("id") DO UPDATE SET
        "status" = excluded."status",
        "current_step_id" = excluded."current_step_id",
        "context" = excluded."context",
        "updated_at" = ?,
        "error" = excluded."error",
        "retry_count" = excluded."retry_count",
        "checkpoint" = excluded."checkpoint",
        "completed_at" = excluded."completed_at"
    `, [
      instance.id, instance.workflowName, instance.version, instance.status,
      instance.currentStepId, JSON.stringify(instance.context),
      instance.startedAt?.toISOString() ?? null, instance.completedAt?.toISOString() ?? null,
      new Date().toISOString(), instance.error, instance.retryCount,
      instance.checkpoint ? JSON.stringify(instance.checkpoint) : null,
      new Date().toISOString(),
    ]);
  }

  getInstance(id: string): WorkflowInstance | undefined {
    const result = this.connection.execute<Record<string, unknown>>(
      `SELECT * FROM "_workflow_instances" WHERE "id" = ?`, [id],
    );
    if (result.rows.length === 0) return undefined;
    return this.rowToInstance(result.rows[0]!);
  }

  findInstances(filter: { status?: WorkflowStatus; workflowName?: string; limit?: number; offset?: number }): WorkflowInstance[] {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filter.status) {
      conditions.push('"status" = ?');
      params.push(filter.status);
    }
    if (filter.workflowName) {
      conditions.push('"workflow_name" = ?');
      params.push(filter.workflowName);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filter.limit ?? 100;
    const offset = filter.offset ?? 0;

    const result = this.connection.execute<Record<string, unknown>>(
      `SELECT * FROM "_workflow_instances" ${where} ORDER BY "updated_at" DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );
    return result.rows.map(r => this.rowToInstance(r));
  }

  saveHistory(entry: HistoryEntry): void {
    this.connection.execute(`
      INSERT INTO "_workflow_history" ("id", "workflow_id", "step_id", "event_type", "status", "data", "timestamp", "duration_ms")
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      entry.id ?? uuid(), entry.workflowId, entry.stepId, entry.eventType,
      entry.status, JSON.stringify(entry.data), entry.timestamp.toISOString(), entry.durationMs,
    ]);
  }

  getHistory(workflowId: string, limit = 100): HistoryEntry[] {
    const result = this.connection.execute<Record<string, unknown>>(
      `SELECT * FROM "_workflow_history" WHERE "workflow_id" = ? ORDER BY "timestamp" ASC LIMIT ?`,
      [workflowId, limit],
    );
    return result.rows.map(r => ({
      id: r['id'] as string,
      workflowId: r['workflow_id'] as string,
      stepId: r['step_id'] as string | null,
      eventType: r['event_type'] as HistoryEntry['eventType'],
      status: r['status'] as string,
      data: JSON.parse(r['data'] as string),
      timestamp: new Date(r['timestamp'] as string),
      durationMs: r['duration_ms'] as number | null,
    }));
  }

  saveCheckpoint(checkpoint: CheckpointData): void {
    this.connection.execute(`
      INSERT INTO "_workflow_checkpoints" ("workflow_id", "step_id", "context", "timestamp", "version")
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT ("workflow_id", "step_id") DO UPDATE SET
        "context" = excluded."context",
        "timestamp" = excluded."timestamp",
        "version" = excluded."version"
    `, [
      checkpoint.workflowId, checkpoint.stepId,
      JSON.stringify(checkpoint.context), checkpoint.timestamp.toISOString(), checkpoint.version,
    ]);
  }

  getCheckpoint(workflowId: string, stepId: string): CheckpointData | undefined {
    const result = this.connection.execute<Record<string, unknown>>(
      `SELECT * FROM "_workflow_checkpoints" WHERE "workflow_id" = ? AND "step_id" = ?`,
      [workflowId, stepId],
    );
    if (result.rows.length === 0) return undefined;
    const r = result.rows[0]!;
    return {
      workflowId: r['workflow_id'] as string,
      stepId: r['step_id'] as string,
      context: JSON.parse(r['context'] as string),
      timestamp: new Date(r['timestamp'] as string),
      version: r['version'] as string,
    };
  }

  deleteCheckpoint(workflowId: string, stepId: string): void {
    this.connection.execute(
      `DELETE FROM "_workflow_checkpoints" WHERE "workflow_id" = ? AND "step_id" = ?`,
      [workflowId, stepId],
    );
  }

  deleteInstance(id: string): void {
    this.connection.execute(`DELETE FROM "_workflow_instances" WHERE "id" = ?`, [id]);
  }

  private rowToInstance(row: Record<string, unknown>): WorkflowInstance {
    return {
      id: row['id'] as string,
      workflowName: row['workflow_name'] as string,
      version: row['version'] as string,
      status: row['status'] as WorkflowStatus,
      currentStepId: row['current_step_id'] as string | null,
      context: JSON.parse(row['context'] as string),
      startedAt: row['started_at'] ? new Date(row['started_at'] as string) : null,
      completedAt: row['completed_at'] ? new Date(row['completed_at'] as string) : null,
      updatedAt: new Date(row['updated_at'] as string),
      error: row['error'] as string | null,
      retryCount: Number(row['retry_count'] ?? 0),
      checkpoint: row['checkpoint'] ? JSON.parse(row['checkpoint'] as string) : null,
    } as WorkflowInstance;
  }
}
