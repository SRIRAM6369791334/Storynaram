import { Injectable, Logger } from '@nestjs/common';
import type { AISession, AIMessage, AIConversation } from '../internal/runtime-types';
import { PostgreSQLConnection } from '../connection/postgresql-connection';

@Injectable()
export class AIStorageAdapter {
  private readonly logger = new Logger(AIStorageAdapter.name);

  constructor(private readonly connection: PostgreSQLConnection) {}

  async ensureTables(): Promise<void> {
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_ai_sessions" (
        "id" TEXT PRIMARY KEY,
        "conversation_id" TEXT NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "metadata" JSONB DEFAULT '{}'
      )
    `);
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_ai_conversations" (
        "id" TEXT PRIMARY KEY,
        "system_prompt" TEXT,
        "max_messages" INTEGER,
        "metadata" JSONB DEFAULT '{}'
      )
    `);
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_ai_messages" (
        "id" SERIAL PRIMARY KEY,
        "conversation_id" TEXT NOT NULL REFERENCES "_ai_conversations"("id") ON DELETE CASCADE,
        "role" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "name" TEXT,
        "tool_call_id" TEXT,
        "tool_calls" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_ai_token_usage" (
        "id" SERIAL PRIMARY KEY,
        "session_id" TEXT NOT NULL,
        "input_tokens" INTEGER NOT NULL DEFAULT 0,
        "output_tokens" INTEGER NOT NULL DEFAULT 0,
        "total_tokens" INTEGER NOT NULL DEFAULT 0,
        "estimated_cost_usd" NUMERIC(10, 6),
        "recorded_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS "_ai_cost_records" (
        "id" SERIAL PRIMARY KEY,
        "provider" TEXT NOT NULL,
        "model" TEXT NOT NULL,
        "input_tokens" INTEGER NOT NULL DEFAULT 0,
        "output_tokens" INTEGER NOT NULL DEFAULT 0,
        "cost_usd" NUMERIC(10, 6) NOT NULL DEFAULT 0,
        "recorded_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await this.connection.execute(`
      CREATE INDEX IF NOT EXISTS "idx_ai_messages_conversation" ON "_ai_messages" ("conversation_id")
    `);
    await this.connection.execute(`
      CREATE INDEX IF NOT EXISTS "idx_ai_token_usage_session" ON "_ai_token_usage" ("session_id")
    `);
  }

  async saveSession(session: AISession): Promise<void> {
    await this.connection.execute(
      `INSERT INTO "_ai_sessions" ("id", "conversation_id", "created_at", "updated_at", "metadata")
       VALUES ($1, $2, $3, $4, $5::jsonb)
       ON CONFLICT ("id") DO UPDATE SET
         "updated_at" = NOW(),
         "metadata" = EXCLUDED."metadata"`,
      [
        session.id,
        session.conversation.id,
        session.createdAt,
        session.updatedAt,
        JSON.stringify(session.metadata),
      ],
    );
    await this.saveConversation(session.conversation, session.id);
  }

  async getSession(id: string): Promise<AISession | undefined> {
    const result = await this.connection.execute<Record<string, unknown>>(
      `SELECT * FROM "_ai_sessions" WHERE "id" = $1`,
      [id],
    );
    if (result.rows.length === 0) return undefined;
    const row = result.rows[0]!;
    const conv = await this.getConversation(row['conversation_id'] as string);
    return {
      id: row['id'] as string,
      conversation: conv ?? {
        id: row['conversation_id'] as string,
        messages: [],
        metadata: {},
      },
      createdAt: row['created_at'] as Date,
      updatedAt: row['updated_at'] as Date,
      metadata: typeof row['metadata'] === 'string' ? JSON.parse(row['metadata'] as string) : (row['metadata'] as Record<string, unknown>),
    };
  }

  async saveConversation(conversation: AIConversation, sessionId?: string): Promise<void> {
    await this.connection.execute(
      `INSERT INTO "_ai_conversations" ("id", "system_prompt", "max_messages", "metadata")
       VALUES ($1, $2, $3, $4::jsonb)
       ON CONFLICT ("id") DO UPDATE SET
         "system_prompt" = EXCLUDED."system_prompt",
         "max_messages" = EXCLUDED."max_messages",
         "metadata" = EXCLUDED."metadata"`,
      [
        conversation.id,
        conversation.systemPrompt ?? null,
        conversation.maxMessages ?? null,
        JSON.stringify(conversation.metadata),
      ],
    );

    for (const msg of conversation.messages) {
      await this.saveMessage(conversation.id, msg);
    }
  }

  async getConversation(id: string): Promise<AIConversation | undefined> {
    const convResult = await this.connection.execute<Record<string, unknown>>(
      `SELECT * FROM "_ai_conversations" WHERE "id" = $1`,
      [id],
    );
    if (convResult.rows.length === 0) return undefined;
    const row = convResult.rows[0]!;
    const messages = await this.getMessages(id);
    return {
      id: row['id'] as string,
      messages,
      systemPrompt: row['system_prompt'] as string | undefined,
      maxMessages: row['max_messages'] as number | undefined,
      metadata: typeof row['metadata'] === 'string' ? JSON.parse(row['metadata'] as string) : (row['metadata'] as Record<string, unknown>),
    };
  }

  private async saveMessage(conversationId: string, msg: AIMessage): Promise<void> {
    const sql = `
      INSERT INTO "_ai_messages" ("conversation_id", "role", "content", "name", "tool_call_id", "tool_calls", "created_at")
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW())
    `;
    await this.connection.execute(sql, [
      conversationId,
      msg.role,
      msg.content,
      msg.name ?? null,
      msg.toolCallId ?? null,
      msg.toolCalls ? JSON.stringify(msg.toolCalls) : null,
    ]);
  }

  private async getMessages(conversationId: string): Promise<AIMessage[]> {
    const result = await this.connection.execute<Record<string, unknown>>(
      `SELECT * FROM "_ai_messages" WHERE "conversation_id" = $1 ORDER BY "created_at" ASC`,
      [conversationId],
    );
    return result.rows.map(r => ({
      role: r['role'] as string,
      content: r['content'] as string,
      name: r['name'] as string | undefined,
      toolCallId: r['tool_call_id'] as string | undefined,
      toolCalls: r['tool_calls'] ? (typeof r['tool_calls'] === 'string' ? JSON.parse(r['tool_calls'] as string) : r['tool_calls'] as Array<Record<string, unknown>>) : undefined,
    } as AIMessage));
  }

  async recordTokenUsage(sessionId: string, inputTokens: number, outputTokens: number, costUsd?: number): Promise<void> {
    const totalTokens = inputTokens + outputTokens;
    await this.connection.execute(
      `INSERT INTO "_ai_token_usage" ("session_id", "input_tokens", "output_tokens", "total_tokens", "estimated_cost_usd", "recorded_at")
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [sessionId, inputTokens, outputTokens, totalTokens, costUsd ?? null],
    );
  }

  async recordCost(provider: string, model: string, inputTokens: number, outputTokens: number, costUsd: number): Promise<void> {
    await this.connection.execute(
      `INSERT INTO "_ai_cost_records" ("provider", "model", "input_tokens", "output_tokens", "cost_usd", "recorded_at")
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [provider, model, inputTokens, outputTokens, costUsd],
    );
  }

  async getSessionTokenUsage(sessionId: string): Promise<{ totalTokens: number; estimatedCostUsd: number }> {
    const result = await this.connection.execute<Record<string, unknown>>(
      `SELECT COALESCE(SUM("total_tokens"), 0) as total_tokens, COALESCE(SUM("estimated_cost_usd"), 0) as cost_usd
       FROM "_ai_token_usage" WHERE "session_id" = $1`,
      [sessionId],
    );
    const row = result.rows[0]!;
    return {
      totalTokens: Number(row['total_tokens']),
      estimatedCostUsd: Number(row['cost_usd']),
    };
  }

  async getTotalCosts(): Promise<{ totalCostUsd: number; byProvider: Record<string, number> }> {
    const result = await this.connection.execute<Record<string, unknown>>(
      `SELECT COALESCE(SUM("cost_usd"), 0) as total_cost FROM "_ai_cost_records"`,
    );
    const totalCost = Number(result.rows[0]!['total_cost']);

    const byProviderResult = await this.connection.execute<Record<string, unknown>>(
      `SELECT "provider", COALESCE(SUM("cost_usd"), 0) as cost FROM "_ai_cost_records" GROUP BY "provider"`,
    );
    const byProvider: Record<string, number> = {};
    for (const row of byProviderResult.rows) {
      byProvider[row['provider'] as string] = Number(row['cost']);
    }

    return { totalCostUsd: totalCost, byProvider };
  }

  async deleteSession(id: string): Promise<void> {
    const session = await this.getSession(id);
    if (session) {
      await this.connection.execute(`DELETE FROM "_ai_messages" WHERE "conversation_id" = $1`, [session.conversation.id]);
      await this.connection.execute(`DELETE FROM "_ai_conversations" WHERE "id" = $1`, [session.conversation.id]);
    }
    await this.connection.execute(`DELETE FROM "_ai_sessions" WHERE "id" = $1`, [id]);
  }
}
