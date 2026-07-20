import { Injectable, Logger } from '@nestjs/common';
import type { AISession, AIMessage, AIConversation } from '../internal/runtime-types';
import { SQLiteConnection } from '../connection/sqlite-connection';

@Injectable()
export class AIStorageAdapter {
  private readonly logger = new Logger(AIStorageAdapter.name);

  constructor(private readonly connection: SQLiteConnection) {}

  ensureTables(): void {
    this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_ai_sessions" (
        "id" TEXT PRIMARY KEY,
        "conversation_id" TEXT NOT NULL,
        "created_at" TEXT NOT NULL,
        "updated_at" TEXT NOT NULL,
        "metadata" TEXT DEFAULT '{}'
      )
    `);
    this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_ai_conversations" (
        "id" TEXT PRIMARY KEY,
        "system_prompt" TEXT,
        "max_messages" INTEGER,
        "metadata" TEXT DEFAULT '{}'
      )
    `);
    this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_ai_messages" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "conversation_id" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "name" TEXT,
        "tool_call_id" TEXT,
        "tool_calls" TEXT,
        "created_at" TEXT NOT NULL,
        FOREIGN KEY ("conversation_id") REFERENCES "_ai_conversations"("id") ON DELETE CASCADE
      )
    `);
    this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_ai_token_usage" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "session_id" TEXT NOT NULL,
        "input_tokens" INTEGER NOT NULL DEFAULT 0,
        "output_tokens" INTEGER NOT NULL DEFAULT 0,
        "total_tokens" INTEGER NOT NULL DEFAULT 0,
        "estimated_cost_usd" REAL,
        "recorded_at" TEXT NOT NULL
      )
    `);
    this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_ai_cost_records" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "provider" TEXT NOT NULL,
        "model" TEXT NOT NULL,
        "input_tokens" INTEGER NOT NULL DEFAULT 0,
        "output_tokens" INTEGER NOT NULL DEFAULT 0,
        "cost_usd" REAL NOT NULL DEFAULT 0,
        "recorded_at" TEXT NOT NULL
      )
    `);
    this.connection.execute(`CREATE INDEX IF NOT EXISTS "idx_ai_messages_conv" ON "_ai_messages" ("conversation_id")`);
    this.connection.execute(`CREATE INDEX IF NOT EXISTS "idx_ai_token_session" ON "_ai_token_usage" ("session_id")`);
  }

  saveSession(session: AISession): void {
    this.connection.execute(
      `INSERT INTO "_ai_sessions" ("id", "conversation_id", "created_at", "updated_at", "metadata")
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT ("id") DO UPDATE SET
         "updated_at" = ?,
         "metadata" = ?`,
      [session.id, session.conversation.id, session.createdAt.toISOString(), session.updatedAt.toISOString(),
       JSON.stringify(session.metadata), new Date().toISOString(), JSON.stringify(session.metadata)],
    );
    this.saveConversation(session.conversation);
  }

  getSession(id: string): AISession | undefined {
    const result = this.connection.execute<Record<string, unknown>>(
      `SELECT * FROM "_ai_sessions" WHERE "id" = ?`, [id],
    );
    if (result.rows.length === 0) return undefined;
    const row = result.rows[0]!;
    const conv = this.getConversation(row['conversation_id'] as string);
    return {
      id: row['id'] as string,
      conversation: conv ?? { id: row['conversation_id'] as string, messages: [], metadata: {} },
      createdAt: new Date(row['created_at'] as string),
      updatedAt: new Date(row['updated_at'] as string),
      metadata: JSON.parse(row['metadata'] as string),
    };
  }

  saveConversation(conversation: AIConversation): void {
    this.connection.execute(
      `INSERT INTO "_ai_conversations" ("id", "system_prompt", "max_messages", "metadata")
       VALUES (?, ?, ?, ?)
       ON CONFLICT ("id") DO UPDATE SET
         "system_prompt" = excluded."system_prompt",
         "max_messages" = excluded."max_messages",
         "metadata" = excluded."metadata"`,
      [conversation.id, conversation.systemPrompt ?? null, conversation.maxMessages ?? null, JSON.stringify(conversation.metadata)],
    );
    for (const msg of conversation.messages) {
      this.saveMessage(conversation.id, msg);
    }
  }

  getConversation(id: string): AIConversation | undefined {
    const convResult = this.connection.execute<Record<string, unknown>>(
      `SELECT * FROM "_ai_conversations" WHERE "id" = ?`, [id],
    );
    if (convResult.rows.length === 0) return undefined;
    const row = convResult.rows[0]!;
    const messages = this.getMessages(id);
    return {
      id: row['id'] as string,
      messages,
      systemPrompt: row['system_prompt'] as string | undefined,
      maxMessages: row['max_messages'] as number | undefined,
      metadata: JSON.parse(row['metadata'] as string),
    };
  }

  recordTokenUsage(sessionId: string, inputTokens: number, outputTokens: number, costUsd?: number): void {
    this.connection.execute(
      `INSERT INTO "_ai_token_usage" ("session_id", "input_tokens", "output_tokens", "total_tokens", "estimated_cost_usd", "recorded_at")
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sessionId, inputTokens, outputTokens, inputTokens + outputTokens, costUsd ?? null, new Date().toISOString()],
    );
  }

  recordCost(provider: string, model: string, inputTokens: number, outputTokens: number, costUsd: number): void {
    this.connection.execute(
      `INSERT INTO "_ai_cost_records" ("provider", "model", "input_tokens", "output_tokens", "cost_usd", "recorded_at")
       VALUES (?, ?, ?, ?, ?, ?)`,
      [provider, model, inputTokens, outputTokens, costUsd, new Date().toISOString()],
    );
  }

  getSessionTokenUsage(sessionId: string): { totalTokens: number; estimatedCostUsd: number } {
    const result = this.connection.execute<Record<string, unknown>>(
      `SELECT COALESCE(SUM("total_tokens"), 0) as total_tokens, COALESCE(SUM("estimated_cost_usd"), 0) as cost_usd
       FROM "_ai_token_usage" WHERE "session_id" = ?`, [sessionId],
    );
    const row = result.rows[0]!;
    return { totalTokens: Number(row['total_tokens']), estimatedCostUsd: Number(row['cost_usd']) };
  }

  getTotalCosts(): { totalCostUsd: number; byProvider: Record<string, number> } {
    const totalResult = this.connection.execute<Record<string, unknown>>(
      `SELECT COALESCE(SUM("cost_usd"), 0) as total_cost FROM "_ai_cost_records"`,
    );
    const totalCost = Number(totalResult.rows[0]!['total_cost']);
    const byProviderResult = this.connection.execute<Record<string, unknown>>(
      `SELECT "provider", COALESCE(SUM("cost_usd"), 0) as cost FROM "_ai_cost_records" GROUP BY "provider"`,
    );
    const byProvider: Record<string, number> = {};
    for (const row of byProviderResult.rows) {
      byProvider[row['provider'] as string] = Number(row['cost']);
    }
    return { totalCostUsd: totalCost, byProvider };
  }

  deleteSession(id: string): void {
    const session = this.getSession(id);
    if (session) {
      this.connection.execute(`DELETE FROM "_ai_messages" WHERE "conversation_id" = ?`, [session.conversation.id]);
      this.connection.execute(`DELETE FROM "_ai_conversations" WHERE "id" = ?`, [session.conversation.id]);
    }
    this.connection.execute(`DELETE FROM "_ai_sessions" WHERE "id" = ?`, [id]);
  }

  private saveMessage(conversationId: string, msg: AIMessage): void {
    this.connection.execute(
      `INSERT INTO "_ai_messages" ("conversation_id", "role", "content", "name", "tool_call_id", "tool_calls", "created_at")
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [conversationId, msg.role, msg.content, msg.name ?? null, msg.toolCallId ?? null,
       msg.toolCalls ? JSON.stringify(msg.toolCalls) : null, new Date().toISOString()],
    );
  }

  private getMessages(conversationId: string): AIMessage[] {
    const result = this.connection.execute<Record<string, unknown>>(
      `SELECT * FROM "_ai_messages" WHERE "conversation_id" = ? ORDER BY "created_at" ASC`, [conversationId],
    );
    return result.rows.map(r => ({
      role: r['role'] as string,
      content: r['content'] as string,
      name: r['name'] as string | undefined,
      toolCallId: r['tool_call_id'] as string | undefined,
      toolCalls: r['tool_calls'] ? JSON.parse(r['tool_calls'] as string) : undefined,
    } as AIMessage));
  }
}
