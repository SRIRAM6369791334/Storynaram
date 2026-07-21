import { describe, it, expect } from 'vitest';
import { PlanningSession } from '../src/planning-session';
import { PlanningContext } from '../src/planning-context';
import type { StoryIdea } from '../src/planning-context';

const sampleIdea: StoryIdea = {
  title: 'Test Story',
  genre: ['fantasy'],
  logline: 'A hero saves the world',
  premise: 'In a world of magic',
  themes: ['heroism'],
  tone: 'epic',
  targetAudience: 'young-adult',
  wordCountGoal: 80000,
};

describe('PlanningSession', () => {
  it('creates with idle status', () => {
    const ctx = new PlanningContext(sampleIdea);
    const session = new PlanningSession('test-1', ctx);
    expect(session.status).toBe('idle');
    expect(session.sessionId).toBe('test-1');
  });

  it('transitions through statuses', () => {
    const ctx = new PlanningContext(sampleIdea);
    const session = new PlanningSession('test-2', ctx);
    session.start();
    expect(session.status).toBe('running');
    session.pause();
    expect(session.status).toBe('paused');
    session.resume();
    expect(session.status).toBe('running');
    session.cancel();
    expect(session.status).toBe('cancelled');
  });

  it('marks complete and stores result', () => {
    const ctx = new PlanningContext(sampleIdea);
    const session = new PlanningSession('test-3', ctx);
    session.start();
    session.setStage('idea-analysis');
    session.setStage('character-planning');
    expect(session.currentStage).toBe('character-planning');
    expect(session.completedStages).toHaveLength(2);
  });

  it('creates checkpoints', () => {
    const ctx = new PlanningContext(sampleIdea);
    const session = new PlanningSession('test-4', ctx);
    session.start();
    const cp = session.createCheckpoint('idea-analysis');
    expect(cp.sessionId).toBe('test-4');
    expect(cp.stage).toBe('idea-analysis');
    expect(session.checkpoints).toHaveLength(1);
  });

  it('gets last checkpoint', () => {
    const ctx = new PlanningContext(sampleIdea);
    const session = new PlanningSession('test-5', ctx);
    session.start();
    session.createCheckpoint('first');
    session.createCheckpoint('second');
    expect(session.getLastCheckpoint()!.stage).toBe('second');
  });

  it('fails with error message', () => {
    const ctx = new PlanningContext(sampleIdea);
    const session = new PlanningSession('test-6', ctx);
    session.fail('Something went wrong');
    expect(session.status).toBe('failed');
    expect(session.error).toBe('Something went wrong');
  });

  it('adds events', () => {
    const ctx = new PlanningContext(sampleIdea);
    const session = new PlanningSession('test-7', ctx);
    session.addEvent({ eventType: 'test', eventId: '1', aggregateId: 'a', aggregateType: 't', timestamp: null as any, payload: {}, metadata: {} } as any);
    expect(session.events).toHaveLength(1);
  });

  it('reports elapsed time', () => {
    const ctx = new PlanningContext(sampleIdea);
    const session = new PlanningSession('test-8', ctx);
    expect(session.getElapsedMs()).toBeGreaterThanOrEqual(0);
  });
});
