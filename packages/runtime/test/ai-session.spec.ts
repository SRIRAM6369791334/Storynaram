import { describe, it, expect, beforeEach } from 'vitest';
import { AISessionManager } from '../src/ai';

describe('AISessionManager', () => {
  let manager: AISessionManager;

  beforeEach(() => {
    manager = new AISessionManager();
  });

  it('should create a session', () => {
    const session = manager.createSession();
    expect(session.id).toBeTruthy();
    expect(session.conversation.messages).toEqual([]);
    expect(session.createdAt).toBeInstanceOf(Date);
  });

  it('should create session with options', () => {
    const session = manager.createSession({ systemPrompt: 'Be helpful', maxMessages: 50, metadata: { key: 'value' } });
    expect(session.conversation.systemPrompt).toBe('Be helpful');
    expect(session.conversation.maxMessages).toBe(50);
    expect(session.metadata.key).toBe('value');
  });

  it('should create session with custom id', () => {
    const session = manager.createSession({ id: 'custom-id' });
    expect(session.id).toBe('custom-id');
  });

  it('should get session by id', () => {
    const created = manager.createSession();
    const retrieved = manager.getSession(created.id);
    expect(retrieved?.id).toBe(created.id);
  });

  it('should return undefined for unknown session', () => {
    expect(manager.getSession('unknown')).toBeUndefined();
  });

  it('should get or create session', () => {
    const created = manager.createSession({ id: 'test-id' });
    const same = manager.getOrCreateSession('test-id');
    expect(same.id).toBe('test-id');
    const created2 = manager.getOrCreateSession('new-id');
    expect(created2.id).toBe('new-id');
  });

  it('should add message to session', () => {
    const session = manager.createSession();
    manager.addMessage(session.id, { role: 'user', content: 'Hello' });
    expect(session.conversation.messages.length).toBe(1);
    expect(session.conversation.messages[0]?.content).toBe('Hello');
  });

  it('should get messages from session', () => {
    const session = manager.createSession();
    manager.addMessage(session.id, { role: 'user', content: 'Q' });
    manager.addMessage(session.id, { role: 'assistant', content: 'A' });
    const messages = manager.getMessages(session.id);
    expect(messages.length).toBe(2);
  });

  it('should throw getting messages from unknown session', () => {
    expect(() => manager.getMessages('unknown')).toThrow();
  });

  it('should clear conversation', () => {
    const session = manager.createSession();
    manager.addMessage(session.id, { role: 'user', content: 'Hello' });
    manager.clearConversation(session.id);
    expect(session.conversation.messages.length).toBe(0);
  });

  it('should delete session', () => {
    const session = manager.createSession();
    expect(manager.deleteSession(session.id)).toBe(true);
    expect(manager.getSession(session.id)).toBeUndefined();
  });

  it('should return false when deleting unknown session', () => {
    expect(manager.deleteSession('unknown')).toBe(false);
  });

  it('should list all sessions', () => {
    manager.createSession();
    manager.createSession();
    expect(manager.listSessions().length).toBe(2);
  });

  it('should list active sessions', () => {
    manager.createSession();
    manager.createSession();
    expect(manager.listActiveSessions(60000).length).toBe(2);
  });

  it('should limit messages to maxMessages', () => {
    const session = manager.createSession({ maxMessages: 2 });
    manager.addMessage(session.id, { role: 'user', content: '1' });
    manager.addMessage(session.id, { role: 'user', content: '2' });
    manager.addMessage(session.id, { role: 'user', content: '3' });
    expect(session.conversation.messages.length).toBe(2);
    expect(session.conversation.messages[0]?.content).toBe('2');
  });

  it('should update metadata', () => {
    const session = manager.createSession();
    manager.updateMetadata(session.id, { newKey: 'newValue' });
    expect(session.metadata.newKey).toBe('newValue');
  });

  it('should track session count', () => {
    expect(manager.size).toBe(0);
    manager.createSession();
    expect(manager.size).toBe(1);
  });

  it('should get conversation from session', () => {
    const session = manager.createSession();
    const conversation = manager.getConversation(session.id);
    expect(conversation?.id).toBe(session.conversation.id);
  });
});
