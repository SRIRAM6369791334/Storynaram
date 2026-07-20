import { Injectable, Logger } from '@nestjs/common';
import type { AISession, AIMessage, AIConversation } from '@storynaram/runtime';
import { RedisConnection } from '../connection/redis-connection';

@Injectable()
export class AICacheAdapter {
  private readonly logger = new Logger(AICacheAdapter.name);
  private readonly keyPrefix: string;

  constructor(
    private readonly connection: RedisConnection,
    keyPrefix?: string,
  ) {
    this.keyPrefix = keyPrefix ?? 'ai';
  }

  async saveSession(session: AISession): Promise<void> {
    const key = this.buildSessionKey(session.id);
    try {
      const client = this.connection.getNativeClient();
      await client.hset(key, {
        id: session.id,
        conversationId: session.conversation.id,
        createdAt: session.createdAt.toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: JSON.stringify(session.metadata),
      });
      await this.saveConversation(session.conversation);
    } catch (err) {
      this.logger.error(`Failed to save AI session: ${(err as Error).message}`);
    }
  }

  async getSession(id: string): Promise<AISession | undefined> {
    const key = this.buildSessionKey(id);
    try {
      const client = this.connection.getNativeClient();
      const data = await client.hgetall(key);
      if (!data || Object.keys(data).length === 0) return undefined;
      const conv = await this.getConversation(data['conversationId']!);
      return {
        id: data['id']!,
        conversation: conv ?? { id: data['conversationId']!, messages: [], metadata: {} },
        createdAt: new Date(data['createdAt']!),
        updatedAt: new Date(data['updatedAt']!),
        metadata: JSON.parse(data['metadata'] ?? '{}'),
      };
    } catch {
      return undefined;
    }
  }

  async saveConversation(conversation: AIConversation): Promise<void> {
    const key = this.buildConversationKey(conversation.id);
    try {
      const client = this.connection.getNativeClient();
      await client.hset(key, {
        id: conversation.id,
        systemPrompt: conversation.systemPrompt ?? '',
        maxMessages: String(conversation.maxMessages ?? ''),
        metadata: JSON.stringify(conversation.metadata),
      });
      for (const msg of conversation.messages) {
        await this.saveMessage(conversation.id, msg);
      }
    } catch (err) {
      this.logger.error(`Failed to save conversation: ${(err as Error).message}`);
    }
  }

  async getConversation(id: string): Promise<AIConversation | undefined> {
    const key = this.buildConversationKey(id);
    try {
      const client = this.connection.getNativeClient();
      const data = await client.hgetall(key);
      if (!data || Object.keys(data).length === 0) return undefined;
      const messages = await this.getMessages(id);
      return {
        id: data['id']!,
        messages,
        systemPrompt: data['systemPrompt'] || undefined,
        maxMessages: data['maxMessages'] ? Number(data['maxMessages']) : undefined,
        metadata: JSON.parse(data['metadata'] ?? '{}'),
      };
    } catch {
      return undefined;
    }
  }

  async recordTokenUsage(sessionId: string, inputTokens: number, outputTokens: number, costUsd?: number): Promise<void> {
    const key = this.buildTokenUsageKey(sessionId);
    const entryId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    try {
      const client = this.connection.getNativeClient();
      await client.hset(`${key}:${entryId}`, {
        sessionId,
        inputTokens: String(inputTokens),
        outputTokens: String(outputTokens),
        totalTokens: String(inputTokens + outputTokens),
        estimatedCostUsd: String(costUsd ?? ''),
        recordedAt: new Date().toISOString(),
      });
      await client.zadd(key, Date.now(), entryId);
      await client.incrby(this.buildTokenTotalKey(sessionId), inputTokens + outputTokens);
      if (costUsd) {
        await client.incrbyfloat(this.buildCostTotalKey(sessionId), costUsd);
      }
    } catch (err) {
      this.logger.error(`Failed to record token usage: ${(err as Error).message}`);
    }
  }

  async recordCost(provider: string, model: string, inputTokens: number, outputTokens: number, costUsd: number): Promise<void> {
    const key = this.buildCostRecordKey();
    const entryId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    try {
      const client = this.connection.getNativeClient();
      await client.hset(`${key}:${entryId}`, {
        provider,
        model,
        inputTokens: String(inputTokens),
        outputTokens: String(outputTokens),
        costUsd: String(costUsd),
        recordedAt: new Date().toISOString(),
      });
      await client.zadd(key, Date.now(), entryId);
      await client.incrbyfloat(this.buildCostSummaryKey(provider), costUsd);
      await client.incrbyfloat(this.buildCostSummaryKey('_total'), costUsd);
    } catch (err) {
      this.logger.error(`Failed to record cost: ${(err as Error).message}`);
    }
  }

  async getSessionTokenUsage(sessionId: string): Promise<{ totalTokens: number; estimatedCostUsd: number }> {
    try {
      const client = this.connection.getNativeClient();
      const totalTokens = Number(await client.get(this.buildTokenTotalKey(sessionId)) || 0);
      const estimatedCostUsd = Number(await client.get(this.buildCostTotalKey(sessionId)) || 0);
      return { totalTokens, estimatedCostUsd };
    } catch {
      return { totalTokens: 0, estimatedCostUsd: 0 };
    }
  }

  async getTotalCosts(): Promise<{ totalCostUsd: number; byProvider: Record<string, number> }> {
    try {
      const client = this.connection.getNativeClient();
      const totalCostUsd = Number(await client.get(this.buildCostSummaryKey('_total')) || 0);
      const pattern = this.buildCostSummaryKey('*');
      const byProvider: Record<string, number> = {};
      let cursor = '0';
      do {
        const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        for (const key of keys) {
          const provider = key.split(':').pop()!;
          if (provider !== '_total') {
            byProvider[provider] = Number(await client.get(key) || 0);
          }
        }
      } while (cursor !== '0');
      return { totalCostUsd, byProvider };
    } catch {
      return { totalCostUsd: 0, byProvider: {} };
    }
  }

  async deleteSession(id: string): Promise<void> {
    const session = await this.getSession(id);
    try {
      const client = this.connection.getNativeClient();
      if (session) {
        await this.deleteMessages(session.conversation.id);
        await client.del(this.buildConversationKey(session.conversation.id));
      }
      await client.del(this.buildSessionKey(id));
    } catch (err) {
      this.logger.error(`Failed to delete session: ${(err as Error).message}`);
    }
  }

  private async saveMessage(conversationId: string, msg: AIMessage): Promise<void> {
    const key = this.buildMessageKey(conversationId);
    const msgId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    try {
      const client = this.connection.getNativeClient();
      await client.hset(`${key}:${msgId}`, {
        conversationId,
        role: msg.role,
        content: msg.content,
        name: msg.name ?? '',
        toolCallId: msg.toolCallId ?? '',
        toolCalls: msg.toolCalls ? JSON.stringify(msg.toolCalls) : '',
        createdAt: new Date().toISOString(),
      });
      await client.rpush(key, msgId);
    } catch (err) {
      this.logger.error(`Failed to save message: ${(err as Error).message}`);
    }
  }

  private async getMessages(conversationId: string): Promise<AIMessage[]> {
    const key = this.buildMessageKey(conversationId);
    try {
      const client = this.connection.getNativeClient();
      const msgIds = await client.lrange(key, 0, -1);
      const messages: AIMessage[] = [];
      for (const msgId of msgIds) {
        const data = await client.hgetall(`${key}:${msgId}`);
        if (data && Object.keys(data).length > 0) {
          messages.push(this.hashToMessage(data));
        }
      }
      return messages;
    } catch {
      return [];
    }
  }

  private async deleteMessages(conversationId: string): Promise<void> {
    const key = this.buildMessageKey(conversationId);
    try {
      const client = this.connection.getNativeClient();
      const msgIds = await client.lrange(key, 0, -1);
      const pipeline = client.pipeline();
      for (const msgId of msgIds) {
        pipeline.del(`${key}:${msgId}`);
      }
      pipeline.del(key);
      await pipeline.exec();
    } catch (err) {
      this.logger.error(`Failed to delete messages: ${(err as Error).message}`);
    }
  }

  private hashToMessage(data: Record<string, string>): AIMessage {
    return {
      role: data['role']!,
      content: data['content']!,
      name: data['name'] || undefined,
      toolCallId: data['toolCallId'] || undefined,
      toolCalls: data['toolCalls'] ? JSON.parse(data['toolCalls']) : undefined,
    } as AIMessage;
  }

  private buildSessionKey(id: string): string { return `${this.keyPrefix}:session:${id}`; }
  private buildConversationKey(id: string): string { return `${this.keyPrefix}:conversation:${id}`; }
  private buildMessageKey(conversationId: string): string { return `${this.keyPrefix}:messages:${conversationId}`; }
  private buildTokenUsageKey(sessionId: string): string { return `${this.keyPrefix}:token-usage:${sessionId}`; }
  private buildTokenTotalKey(sessionId: string): string { return `${this.keyPrefix}:token-total:${sessionId}`; }
  private buildCostTotalKey(sessionId: string): string { return `${this.keyPrefix}:cost-total:${sessionId}`; }
  private buildCostRecordKey(): string { return `${this.keyPrefix}:cost-records`; }
  private buildCostSummaryKey(provider: string): string { return `${this.keyPrefix}:cost-summary:${provider}`; }
}
