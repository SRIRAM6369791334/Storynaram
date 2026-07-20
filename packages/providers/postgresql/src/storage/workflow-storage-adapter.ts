import { Injectable, Logger } from '@nestjs/common';
import type { WorkflowInstance, CheckpointData, WorkflowStatus } from '@storynaram/runtime';
import type { HistoryEntry } from '../internal/runtime-types';
import { PostgreSQLConnection } from '../connection/postgresql-connection';
import { QueryCompiler } from '../query/query-compiler';
import { v4 as uuid } from 'uuid';

@Injectable()
export class WorkflowStorageAdapter {
  private readonly logger = new Logger(WorkflowStorageAdapter.name);

  constructor(
    private readonly connection: PostgreSQLConnection,
    private readonly queryCompiler: QueryCompiler,
  ) {}

  async ensureTables(): Promise<void> {
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_workflow_instances" (
        "id" TEXT PRIMARY KEY,
        "workflow_name" TEXT NOT NULL,
        "version" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "current_step_id" TEXT,
        "context" JSONB DEFAULT '{}',
        "started_at" TIMESTAMPTZ,
        "completed_at" TIMESTAMPTZ,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "error" TEXT,
        "retry_count" INTEGER DEFAULT 0,
        "checkpoint" JSONB
      )
    `);
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_workflow_history" (
        "id" TEXT PRIMARY KEY,
        "workflow_id" TEXT NOT NULL REFERENCES "_workflow_instances"("id") ON DELETE CASCADE,
        "step_id" TEXT,
        "event_type" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "data" JSONB DEFAULT '{}',
        "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "duration_ms" INTEGER
      )
    `);
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_workflow_checkpoints" (
        "workflow_id" TEXT NOT NULL,
        "step_id" TEXT NOT NULL,
        "context" JSONB NOT NULL DEFAULT '{}',
        "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "version" TEXT NOT NULL,
        PRIMARY KEY ("workflow_id", "step_id")
      )
    `);
    await this.connection.execute(`
      CREATE INDEX IF NOT EXISTS "idx_wf_history_workflow" ON "_workflow_history" ("workflow_id")
    `);
  }

  async saveInstance(instance: WorkflowInstance): Promise<void> {
    const sql = `
      INSERT INTO "_workflow_instances" (
        "id", "workflow_name", "version", "status", "current_step_id", "context",
        "started_at", "completed_at", "updated_at", "error", "retry_count", "checkpoint"
      ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11, $12::jsonb)
      ON CONFLICT ("id") DO UPDATE SET
        "status" = EXCLUDED."status",
        "current_step_id" = EXCLUDED."current_step_id",
        "context" = EXCLUDED."context",
        "updated_at" = NOW(),
        "error" = EXCLUDED."error",
        "retry_count" = EXCLUDED."retry_count",
        "checkpoint" = EXCLUDED."checkpoint",
        "completed_at" = EXCLUDED."completed_at"
    `;

    await this.connection.execute(sql, [
      instance.id,
      instance.workflowName,
      instance.version,
      instance.status,
      instance.currentStepId,
      JSON.stringify(instance.context),
      instance.startedAt,
      instance.completedAt,
      instance.updatedAt,
      instance.error,
      instance.retryCount,
      instance.checkpoint ? JSON.stringify(instance.checkpoint) : null,
    ]);
  }

  async getInstance(id: string): Promise<WorkflowInstance | undefined> {
    const result = await this.connection.execute<Record<string, unknown>>(
      `SELECT * FROM "_workflow_instances" WHERE "id" = $1`,
      [id],
    );
    if (result.rows.length === 0) return undefined;
    return this.rowToInstance(result.rows[0]!);
  }

  async findInstances(filter: { status?: WorkflowStatus; workflowName?: string; limit?: number; offset?: number }): Promise<WorkflowInstance[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (filter.status) {
      conditions.push(`"status" = $${idx++}`);
      params.push(filter.status);
    }
    if (filter.workflowName) {
      conditions.push(`"workflow_name" = $${idx++}`);
      params.push(filter.workflowName);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filter.limit ?? 100;
    const offset = filter.offset ?? 0;

    const result = await this.connection.execute<Record<string, unknown>>(
      `SELECT * FROM "_workflow_instances" ${where} ORDER BY "updated_at" DESC LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset],
    );
    return result.rows.map(r => this.rowToInstance(r));
  }

  async saveHistory(entry: HistoryEntry): Promise<void> {
    const sql = `
      INSERT INTO "_workflow_history" ("id", "workflow_id", "step_id", "event_type", "status", "data", "timestamp", "duration_ms")
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)
    `;
    await this.connection.execute(sql, [
      entry.id ?? uuid(),
      entry.workflowId,
      entry.stepId,
      entry.eventType,
      entry.status,
      JSON.stringify(entry.data),
      entry.timestamp,
      entry.durationMs,
    ]);
  }

  async getHistory(workflowId: string, limit = 100): Promise<HistoryEntry[]> {
    const result = await this.connection.execute<Record<string, unknown>>(
      `SELECT * FROM "_workflow_history" WHERE "workflow_id" = $1 ORDER BY "timestamp" ASC LIMIT $2`,
      [workflowId, limit],
    );
    return result.rows.map(r => ({
      id: r['id'] as string,
      workflowId: r['workflow_id'] as string,
      stepId: r['step_id'] as string | null,
      eventType: r['event_type'] as HistoryEntry['eventType'],
      status: r['status'] as string,
      data: typeof r['data'] === 'string' ? JSON.parse(r['data'] as string) : (r['data'] as Record<string, unknown>),
      timestamp: r['timestamp'] as Date,
      durationMs: r['duration_ms'] as number | null,
    }));
  }

  async saveCheckpoint(checkpoint: CheckpointData): Promise<void> {
    const sql = `
      INSERT INTO "_workflow_checkpoints" ("workflow_id", "step_id", "context", "timestamp", "version")
      VALUES ($1, $2, $3::jsonb, $4, $5)
      ON CONFLICT ("workflow_id", "step_id") DO UPDATE SET
        "context" = EXCLUDED."context",
        "timestamp" = EXCLUDED."timestamp",
        "version" = EXCLUDED."version"
    `;
    await this.connection.execute(sql, [
      checkpoint.workflowId,
      checkpoint.stepId,
      JSON.stringify(checkpoint.context),
      checkpoint.timestamp,
      checkpoint.version,
    ]);
  }

  async getCheckpoint(workflowId: string, stepId: string): Promise<CheckpointData | undefined> {
    const result = await this.connection.execute<Record<string, unknown>>(
      `SELECT * FROM "_workflow_checkpoints" WHERE "workflow_id" = $1 AND "step_id" = $2`,
      [workflowId, stepId],
    );
    if (result.rows.length === 0) return undefined;
    const r = result.rows[0]!;
    return {
      workflowId: r['workflow_id'] as string,
      stepId: r['step_id'] as string,
      context: typeof r['context'] === 'string' ? JSON.parse(r['context'] as string) : (r['context'] as Record<string, unknown>),
      timestamp: r['timestamp'] as Date,
      version: r['version'] as string,
    };
  }

  async deleteCheckpoint(workflowId: string, stepId: string): Promise<void> {
    await this.connection.execute(
      `DELETE FROM "_workflow_checkpoints" WHERE "workflow_id" = $1 AND "step_id" = $2`,
      [workflowId, stepId],
    );
  }

  async deleteInstance(id: string): Promise<void> {
    await this.connection.execute(
      `DELETE FROM "_workflow_instances" WHERE "id" = $1`,
      [id],
    );
  }

  private rowToInstance(row: Record<string, unknown>): WorkflowInstance {
    return {
      id: row['id'] as string,
      workflowName: row['workflow_name'] as string,
      version: row['version'] as string,
      status: row['status'] as WorkflowStatus,
      currentStepId: row['current_step_id'] as string | null,
      context: typeof row['context'] === 'string' ? JSON.parse(row['context'] as string) : (row['context'] as Record<string, unknown>),
      startedAt: row['started_at'] as Date | null,
      completedAt: row['completed_at'] as Date | null,
      updatedAt: row['updated_at'] as Date,
      error: row['error'] as string | null,
      retryCount: Number(row['retry_count'] ?? 0),
      checkpoint: row['checkpoint'] ? (typeof row['checkpoint'] === 'string' ? JSON.parse(row['checkpoint'] as string) : row['checkpoint'] as string | null) : null,
    } as WorkflowInstance;
  }
}
