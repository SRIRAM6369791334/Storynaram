import { describe, it, expect } from 'vitest';
import { PlanningMemory } from '../src/planning-memory';
import { PlanningSession } from '../src/planning-session';
import { PlanningContext } from '../src/planning-context';
import type { StoryIdea } from '../src/planning-context';

const sampleIdea: StoryIdea = {
  title: 'Test', genre: ['f'], logline: 'L', premise: 'P', themes: [], tone: 't', targetAudience: 'a', wordCountGoal: 50000,
};

function createSession(id: string): PlanningSession {
  return new PlanningSession(id, new PlanningContext(sampleIdea));
}

describe('PlanningMemory', () => {
  it('saves and retrieves sessions', () => {
    const memory = new PlanningMemory();
    const session = createSession('s1');
    memory.saveSession(session);
    expect(memory.getSession('s1')).toBe(session);
    expect(memory.getAllSessions()).toHaveLength(1);
  });

  it('deletes sessions', () => {
    const memory = new PlanningMemory();
    memory.saveSession(createSession('s1'));
    expect(memory.deleteSession('s1')).toBe(true);
    expect(memory.getSession('s1')).toBeUndefined();
  });

  it('returns active session count', () => {
    const memory = new PlanningMemory();
    const s1 = createSession('s1');
    s1.start();
    memory.saveSession(s1);
    memory.saveSession(createSession('s2'));
    expect(memory.getActiveSessionCount()).toBe(1);
  });

  it('saves and retrieves results', () => {
    const memory = new PlanningMemory();
    const session = createSession('s1');
    memory.saveSession(session);
    const result = { sessionId: 's1' } as any;
    memory.saveResult(result);
    expect(memory.getResult('s1')).toBe(result);
  });

  it('saves and retrieves contexts', () => {
    const memory = new PlanningMemory();
    const ctx = new PlanningContext(sampleIdea);
    memory.saveContext('s1', ctx);
    expect(memory.getContext('s1')).toBe(ctx);
  });

  it('clears all data', () => {
    const memory = new PlanningMemory();
    memory.saveSession(createSession('s1'));
    memory.saveSession(createSession('s2'));
    memory.clear();
    expect(memory.getTotalSessionCount()).toBe(0);
  });
});
