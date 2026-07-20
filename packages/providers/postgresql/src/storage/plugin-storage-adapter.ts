import { Injectable, Logger } from '@nestjs/common';
import type { PluginId } from '../internal/runtime-types';
import { PostgreSQLConnection } from '../connection/postgresql-connection';

@Injectable()
export class PluginStorageAdapter {
  private readonly logger = new Logger(PluginStorageAdapter.name);

  constructor(private readonly connection: PostgreSQLConnection) {}

  async ensureTables(): Promise<void> {
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_plugin_configurations" (
        "plugin_id" TEXT PRIMARY KEY,
        "config" JSONB NOT NULL DEFAULT '{}',
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_plugin_states" (
        "plugin_id" TEXT PRIMARY KEY,
        "status" TEXT NOT NULL DEFAULT 'discovered',
        "state" JSONB NOT NULL DEFAULT '{}',
        "error_count" INTEGER DEFAULT 0,
        "last_error" TEXT,
        "started_at" TIMESTAMPTZ,
        "stopped_at" TIMESTAMPTZ,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_plugin_metrics" (
        "id" SERIAL PRIMARY KEY,
        "plugin_id" TEXT NOT NULL,
        "metric_name" TEXT NOT NULL,
        "metric_value" NUMERIC(20, 4) NOT NULL,
        "recorded_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await this.connection.execute(`
      CREATE INDEX IF NOT EXISTS "idx_plugin_metrics_plugin" ON "_plugin_metrics" ("plugin_id")
    `);
  }

  async saveConfiguration(pluginId: PluginId, config: Record<string, unknown>): Promise<void> {
    const result = await this.connection.execute(
      `SELECT 1 FROM "_plugin_configurations" WHERE "plugin_id" = $1`,
      [pluginId],
    );

    if (result.rowCount > 0) {
      await this.connection.execute(
        `UPDATE "_plugin_configurations" SET "config" = $2::jsonb, "updated_at" = NOW() WHERE "plugin_id" = $1`,
        [pluginId, JSON.stringify(config)],
      );
    } else {
      await this.connection.execute(
        `INSERT INTO "_plugin_configurations" ("plugin_id", "config", "updated_at") VALUES ($1, $2::jsonb, NOW())`,
        [pluginId, JSON.stringify(config)],
      );
    }
  }

  async getConfiguration(pluginId: PluginId): Promise<Record<string, unknown> | undefined> {
    const result = await this.connection.execute<Record<string, unknown>>(
      `SELECT "config" FROM "_plugin_configurations" WHERE "plugin_id" = $1`,
      [pluginId],
    );
    if (result.rows.length === 0) return undefined;
    const raw = result.rows[0]!['config'];
    return typeof raw === 'string' ? JSON.parse(raw as string) : (raw as Record<string, unknown>);
  }

  async saveState(pluginId: PluginId, state: {
    status: string;
    stateData: Record<string, unknown>;
    errorCount?: number;
    lastError?: string;
    startedAt?: Date;
    stoppedAt?: Date;
  }): Promise<void> {
    const result = await this.connection.execute(
      `SELECT 1 FROM "_plugin_states" WHERE "plugin_id" = $1`,
      [pluginId],
    );

    if (result.rowCount > 0) {
      await this.connection.execute(
        `UPDATE "_plugin_states" SET
          "status" = $2, "state" = $3::jsonb, "error_count" = $4, "last_error" = $5,
          "started_at" = $6, "stopped_at" = $7, "updated_at" = NOW()
         WHERE "plugin_id" = $1`,
        [pluginId, state.status, JSON.stringify(state.stateData), state.errorCount ?? 0, state.lastError ?? null, state.startedAt ?? null, state.stoppedAt ?? null],
      );
    } else {
      await this.connection.execute(
        `INSERT INTO "_plugin_states" ("plugin_id", "status", "state", "error_count", "last_error", "started_at", "stopped_at", "updated_at")
         VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, NOW())`,
        [pluginId, state.status, JSON.stringify(state.stateData), state.errorCount ?? 0, state.lastError ?? null, state.startedAt ?? null, state.stoppedAt ?? null],
      );
    }
  }

  async getState(pluginId: PluginId): Promise<Record<string, unknown> | undefined> {
    const result = await this.connection.execute<Record<string, unknown>>(
      `SELECT * FROM "_plugin_states" WHERE "plugin_id" = $1`,
      [pluginId],
    );
    if (result.rows.length === 0) return undefined;
    return result.rows[0]!;
  }

  async recordMetric(pluginId: PluginId, metricName: string, value: number): Promise<void> {
    await this.connection.execute(
      `INSERT INTO "_plugin_metrics" ("plugin_id", "metric_name", "metric_value", "recorded_at") VALUES ($1, $2, $3, NOW())`,
      [pluginId, metricName, value],
    );
  }

  async getMetrics(pluginId: PluginId, metricName?: string, limit = 100): Promise<Array<{ name: string; value: number; recordedAt: Date }>> {
    const conditions = ['"plugin_id" = $1'];
    const params: unknown[] = [pluginId];
    let idx = 2;

    if (metricName) {
      conditions.push(`"metric_name" = $${idx++}`);
      params.push(metricName);
    }

    const result = await this.connection.execute<Record<string, unknown>>(
      `SELECT "metric_name", "metric_value", "recorded_at" FROM "_plugin_metrics" WHERE ${conditions.join(' AND ')} ORDER BY "recorded_at" DESC LIMIT $${idx}`,
      [...params, limit],
    );
    return result.rows.map(r => ({
      name: r['metric_name'] as string,
      value: Number(r['metric_value']),
      recordedAt: r['recorded_at'] as Date,
    }));
  }

  async deletePluginData(pluginId: PluginId): Promise<void> {
    await this.connection.execute(`DELETE FROM "_plugin_configurations" WHERE "plugin_id" = $1`, [pluginId]);
    await this.connection.execute(`DELETE FROM "_plugin_states" WHERE "plugin_id" = $1`, [pluginId]);
    await this.connection.execute(`DELETE FROM "_plugin_metrics" WHERE "plugin_id" = $1`, [pluginId]);
  }
}
