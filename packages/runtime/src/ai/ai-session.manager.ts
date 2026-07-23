import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { AISession, AIConversation, AIMessage } from './types.js';

export interface AISessionOptions {
  id?: string;
  systemPrompt?: string;
  maxMessages?: number;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AISessionManager {
  private readonly logger = new Logger(AISessionManager.name);
  private readonly sessions: Map<string, AISession> = new Map();

  createSession(options?: AISessionOptions): AISession {
    const id = options?.id ?? uuid();
    const conversation: AIConversation = {
      id: uuid(),
      messages: [],
      maxMessages: options?.maxMessages ?? 100,
      systemPrompt: options?.systemPrompt,
      metadata: {},
    };

    const session: AISession = {
      id,
      conversation,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: options?.metadata ?? {},
    };

    this.sessions.set(id, session);
    this.logger.debug(`Created AI session: ${id}`);
    return session;
  }

  getSession(sessionId: string): AISession | undefined {
    return this.sessions.get(sessionId);
  }

  getOrCreateSession(sessionId: string, options?: AISessionOptions): AISession {
    const existing = this.sessions.get(sessionId);
    if (existing) return existing;
    return this.createSession({ ...options, id: sessionId });
  }

  deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) this.logger.debug(`Deleted AI session: ${sessionId}`);
    return deleted;
  }

  addMessage(sessionId: string, message: AIMessage): void {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session "${sessionId}" not found`);

    session.conversation.messages.push(message);
    session.updatedAt = new Date();

    if (session.conversation.maxMessages &&
        session.conversation.messages.length > session.conversation.maxMessages) {
      const excess = session.conversation.messages.length - session.conversation.maxMessages;
      session.conversation.messages.splice(0, excess);
    }
  }

  getMessages(sessionId: string): AIMessage[] {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session "${sessionId}" not found`);
    return [...session.conversation.messages];
  }

  getConversation(sessionId: string): AIConversation | undefined {
    return this.sessions.get(sessionId)?.conversation;
  }

  clearConversation(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.conversation.messages = [];
      session.updatedAt = new Date();
    }
  }

  listSessions(): AISession[] {
    return Array.from(this.sessions.values());
  }

  listActiveSessions(maxAgeMs: number = 3600000): AISession[] {
    const cutoff = Date.now() - maxAgeMs;
    return Array.from(this.sessions.values()).filter(s => s.updatedAt.getTime() > cutoff);
  }

  updateMetadata(sessionId: string, metadata: Record<string, unknown>): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session.metadata, metadata);
      session.updatedAt = new Date();
    }
  }

  get size(): number {
    return this.sessions.size;
  }
}
