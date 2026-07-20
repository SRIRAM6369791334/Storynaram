import { Injectable, Logger } from '@nestjs/common';
import type { PluginId } from '../internal/runtime-types';
import { SQLiteConnection } from '../connection/sqlite-connection';

@Injectable()
export class PluginStorageAdapter {
  private readonly logger = new Logger(PluginStorageAdapter.name);

  constructor(private readonly connection: SQLiteConnection) {}

  ensureTables(): void {
    this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_plugin_configurations" (
        "plugin_id" TEXT PRIMARY KEY,
        "config" TEXT NOT NULL DEFAULT '{}',
        "updated_at" TEXT NOT NULL
      )
    `);
    this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_plugin_states" (
        "plugin_id" TEXT PRIMARY KEY,
        "status" TEXT NOT NULL DEFAULT 'discovered',
        "state" TEXT NOT NULL DEFAULT '{}',
        "error_count" INTEGER DEFAULT 0,
        "last_error" TEXT,
        "started_at" TEXT,
        "stopped_at" TEXT,
        "updated_at" TEXT NOT NULL
      )
    `);
    this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_plugin_metrics" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "plugin_id" TEXT NOT NULL,
        "metric_name" TEXT NOT NULL,
        "metric_value" REAL NOT NULL,
        "recorded_at" TEXT NOT NULL
      )
    `);
    this.connection.execute(`CREATE INDEX IF NOT EXISTS "idx_plugin_metrics_id" ON "_plugin_metrics" ("plugin_id")`);
  }

  saveConfiguration(pluginId: PluginId, config: Record<string, unknown>): void {
    this.connection.execute(`
      INSERT INTO "_plugin_configurations" ("plugin_id", "config", "updated_at") VALUES (?, ?, ?)
      ON CONFLICT ("plugin_id") DO UPDATE SET "config" = ?, "updated_at" = ?
    `, [pluginId, JSON.stringify(config), new Date().toISOString(), JSON.stringify(config), new Date().toISOString()]);
  }

  getConfiguration(pluginId: PluginId): Record<string, unknown> | undefined {
    const result = this.connection.execute<{ config: string }>(
      `SELECT "config" FROM "_plugin_configurations" WHERE "plugin_id" = ?`, [pluginId],
    );
    if (result.rows.length === 0) return undefined;
    return JSON.parse(result.rows[0]!.config);
  }

  saveState(pluginId: PluginId, state: { status: string; stateData: Record<string, unknown>; errorCount?: number; lastError?: string; startedAt?: Date; stoppedAt?: Date }): void {
    this.connection.execute(`
      INSERT INTO "_plugin_states" ("plugin_id", "status", "state", "error_count", "last_error", "started_at", "stopped_at", "updated_at")
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT ("plugin_id") DO UPDATE SET
        "status" = ?, "state" = ?, "error_count" = ?, "last_error" = ?,
        "started_at" = ?, "stopped_at" = ?, "updated_at" = ?
    `, [
      pluginId, state.status, JSON.stringify(state.stateData), state.errorCount ?? 0,
      state.lastError ?? null, state.startedAt?.toISOString() ?? null, state.stoppedAt?.toISOString() ?? null,
      new Date().toISOString(),
      state.status, JSON.stringify(state.stateData), state.errorCount ?? 0,
      state.lastError ?? null, state.startedAt?.toISOString() ?? null, state.stoppedAt?.toISOString() ?? null,
      new Date().toISOString(),
    ]);
  }

  getState(pluginId: PluginId): Record<string, unknown> | undefined {
    const result = this.connection.execute<Record<string, unknown>>(
      `SELECT * FROM "_plugin_states" WHERE "plugin_id" = ?`, [pluginId],
    );
    if (result.rows.length === 0) return undefined;
    return result.rows[0]!;
  }

  recordMetric(pluginId: PluginId, metricName: string, value: number): void {
    this.connection.execute(
      `INSERT INTO "_plugin_metrics" ("plugin_id", "metric_name", "metric_value", "recorded_at") VALUES (?, ?, ?, ?)`,
      [pluginId, metricName, value, new Date().toISOString()],
    );
  }

  getMetrics(pluginId: PluginId, metricName?: string, limit = 100): Array<{ name: string; value: number; recordedAt: Date }> {
    const conditions: string[] = ['"plugin_id" = ?'];
    const params: unknown[] = [pluginId];
    if (metricName) {
      conditions.push('"metric_name" = ?');
      params.push(metricName);
    }
    const result = this.connection.execute<Record<string, unknown>>(
      `SELECT "metric_name", "metric_value", "recorded_at" FROM "_plugin_metrics" WHERE ${conditions.join(' AND ')} ORDER BY "recorded_at" DESC LIMIT ?`,
      [...params, limit],
    );
    return result.rows.map(r => ({
      name: r['metric_name'] as string,
      value: Number(r['metric_value']),
      recordedAt: new Date(r['recorded_at'] as string),
    }));
  }

  deletePluginData(pluginId: PluginId): void {
    this.connection.execute(`DELETE FROM "_plugin_configurations" WHERE "plugin_id" = ?`, [pluginId]);
    this.connection.execute(`DELETE FROM "_plugin_states" WHERE "plugin_id" = ?`, [pluginId]);
    this.connection.execute(`DELETE FROM "_plugin_metrics" WHERE "plugin_id" = ?`, [pluginId]);
  }
}
