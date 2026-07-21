import { describe, it, expect } from 'vitest';
import { ExecutionSession } from '../src/execution-session';
import type { ExecutionContext } from '../src/execution-context';
import { PlanningResult } from '@storynaram/narrative-planner';

function makeMockResult(): PlanningResult {
  return new PlanningResult({
    sessionId: 'plan-1',
    storyPlan: { title: 'Test', genre: ['fantasy'], logline: '', premise: '', themes: [], characterCount: 1, worldCount: 1, timelineEvents: 0, narrativeChapters: 1, compositionArcs: 0 },
    characterPlan: { characterId: 'c1', name: 'Hero', role: 'protagonist', arc: '', traits: [], goals: [], conflicts: [], relationships: [], validated: true },
    worldPlan: { worldId: 'w1', name: 'World', regions: [], factions: [], magicSystem: '', technologyLevel: '', cultures: [], history: [], validated: true },
    timelinePlan: { timelineId: 't1', name: 'Timeline', events: [], branches: [], validated: true },
    narrativePlan: { narrativeId: 'n1', title: 'Story', synopsis: '', chapters: [], wordCount: 0, status: '', validated: true },
    compositionPlan: { storyId: 's1', plotStructure: '', arcs: [], themes: [], conflicts: [], foreshadowing: [], objectives: [], validated: true },
    promptPackage: { storyPlan: '', characterProfiles: '', worldBible: '', timelineReference: '', compositionGuide: '', styleGuide: '', assembledPrompt: '' },
    durationMs: 100,
    stageCount: 6,
  });
}

const mockContext: ExecutionContext = {
  sessionId: 'test-session',
  planningResult: makeMockResult(),
  aiRuntime: {} as any,
  options: { model: 'gpt-4' },
};

describe('ExecutionSession', () => {
  it('creates session with created status', () => {
    const session = new ExecutionSession({
      sessionId: 's1',
      planningResult: makeMockResult(),
      context: mockContext,
    });

    expect(session.sessionId).toBe('s1');
    expect(session.status).toBe('created');
    expect(session.memory).toBeDefined();
    expect(session.statistics).toBeDefined();
    expect(session.checkpoints).toEqual([]);
    expect(session.createdAt).toBeInstanceOf(Date);
  });

  it('updates updatedAt on addCheckpoint', () => {
    const session = new ExecutionSession({
      sessionId: 's2',
      planningResult: makeMockResult(),
      context: mockContext,
    });

    const before = session.updatedAt.getTime();
    session.addCheckpoint({
      sessionId: 's2',
      stage: 'test',
      timestamp: new Date(),
      status: 'initializing',
      completedTaskIds: [],
      memory: { history: [], intermediateOutputs: new Map(), sharedContext: new Map(), retryStates: new Map() },
      metadata: {},
    });

    expect(session.checkpoints).toHaveLength(1);
    expect(session.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it('tracks completion time', () => {
    const session = new ExecutionSession({
      sessionId: 's3',
      planningResult: makeMockResult(),
      context: mockContext,
    });

    session.status = 'completed';
    session.completedAt = new Date();

    expect(session.status).toBe('completed');
    expect(session.completedAt).toBeInstanceOf(Date);
  });

  it('tracks error state', () => {
    const session = new ExecutionSession({
      sessionId: 's4',
      planningResult: makeMockResult(),
      context: mockContext,
    });

    session.status = 'failed';
    session.error = 'Something went wrong';

    expect(session.status).toBe('failed');
    expect(session.error).toBe('Something went wrong');
  });

  it('serializes to JSON correctly', () => {
    const session = new ExecutionSession({
      sessionId: 's5',
      planningResult: makeMockResult(),
      context: mockContext,
    });

    const json = session.toJSON();
    expect(json.sessionId).toBe('s5');
    expect(json.status).toBe('created');
    expect(json.checkpointCount).toBe(0);
    expect(json.memoryRecordCount).toBe(0);
  });
});
