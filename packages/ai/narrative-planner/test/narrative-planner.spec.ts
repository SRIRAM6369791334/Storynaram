import { describe, it, expect } from 'vitest';
import { NarrativePlanner } from '../src/narrative-planner';
import type { StoryIdea } from '../src/planning-context';

const sampleIdea: StoryIdea = {
  title: 'The Crystal King',
  genre: ['fantasy', 'epic'],
  logline: 'A young orphan discovers he is the last heir to a fallen kingdom.',
  premise: 'Magic flows through bloodlines',
  themes: ['destiny', 'sacrifice'],
  tone: 'epic',
  targetAudience: 'young-adult',
  wordCountGoal: 100000,
};

describe('NarrativePlanner', () => {
  it('creates session from idea', async () => {
    const planner = new NarrativePlanner();
    const session = await planner.createSession(sampleIdea);
    expect(session.sessionId).toBeDefined();
    expect(session.context.idea.title).toBe('The Crystal King');
  });

  it('executes full planning pipeline', async () => {
    const planner = new NarrativePlanner({ maxRetries: 1, pipelineMode: 'sequential' });
    const result = await planner.plan(sampleIdea);
    expect(result.storyPlan.title).toBe('The Crystal King');
    expect(result.characterPlan).toBeDefined();
    expect(result.worldPlan).toBeDefined();
    expect(result.timelinePlan).toBeDefined();
    expect(result.narrativePlan).toBeDefined();
    expect(result.compositionPlan).toBeDefined();
    expect(result.promptPackage).toBeDefined();
    expect(result.durationMs).toBeGreaterThan(0);
  });

  it('stores sessions and results', async () => {
    const planner = new NarrativePlanner();
    await planner.plan(sampleIdea);
    expect(planner.getAllSessions().length).toBeGreaterThan(0);
    expect(planner.getAllResults().length).toBeGreaterThan(0);
  });

  it('supports pause and resume', async () => {
    const planner = new NarrativePlanner();
    const session = await planner.createSession(sampleIdea);
    await planner.pauseSession(session.sessionId);
    expect(planner.getSession(session.sessionId)!.status).toBe('paused');
    const result = await planner.resumeSession(session.sessionId);
    expect(result.storyPlan.title).toBe('The Crystal King');
  });

  it('supports cancellation', async () => {
    const planner = new NarrativePlanner();
    const session = await planner.createSession(sampleIdea);
    await planner.cancelSession(session.sessionId);
    expect(planner.getSession(session.sessionId)!.status).toBe('cancelled');
  });

  it('reports health', async () => {
    const planner = new NarrativePlanner();
    const health = planner.health();
    expect(health.status).toBe('healthy');
    expect(health.totalSessions).toBeGreaterThanOrEqual(0);
  });

  it('reports statistics', async () => {
    const planner = new NarrativePlanner();
    await planner.plan(sampleIdea);
    const stats = planner.getStatistics();
    expect(stats.totalSessions).toBeGreaterThan(0);
    expect(stats.successRate).toBeGreaterThanOrEqual(0);
  });

  it('provides graph', () => {
    const planner = new NarrativePlanner();
    const graph = planner.getGraph();
    expect(graph.getAllStages().length).toBeGreaterThan(0);
  });

  it('provides memory', () => {
    const planner = new NarrativePlanner();
    expect(planner.getMemory()).toBeDefined();
  });

  it('throws on unknown session', async () => {
    const planner = new NarrativePlanner();
    await expect(planner.pauseSession('unknown')).rejects.toThrow('not found');
  });
});
