import { describe, it, expect, vi } from 'vitest';
import {
  executeNarrativePlan,
  NarrativeExecutionStartedEvent,
  ExecutionStageCompletedEvent,
  NarrativeExecutionCompletedEvent,
  NarrativeExecutionFailedEvent,
} from '../src/integration';
import { NarrativeExecutionEngine } from '../src/narrative-execution-engine';
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

describe('Integration', () => {
  it('executeNarrativePlan calls engine.execute', async () => {
    const mockEngine = {
      execute: vi.fn().mockResolvedValue({ sessionId: 'exec-1', storyDraft: { title: 'Test' }, executionReport: { status: 'completed', stages: [], totalDurationMs: 100, totalTokens: 0, sessionId: 'exec-1', model: 'gpt-4' }, validationReport: { passed: true, validations: [], summary: '' }, statistics: { totalTasks: 1, completedTasks: 1, failedTasks: 0, totalDurationMs: 100, totalTokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }, agentTimings: [], stageTimings: [] }, completedAt: new Date() } as any),
    } as any;

    const plan = makeMockResult();
    const result = await executeNarrativePlan(mockEngine, plan, { model: 'gpt-4' });
    expect(mockEngine.execute).toHaveBeenCalledTimes(1);
    expect(mockEngine.execute).toHaveBeenCalledWith(plan, { model: 'gpt-4' }, undefined);
    expect(result.sessionId).toBe('exec-1');
  });

  it('NarrativeExecutionStartedEvent has sessionId and planSessionId', () => {
    const event = new NarrativeExecutionStartedEvent('exec-1', 'plan-1');
    expect(event.sessionId).toBe('exec-1');
    expect(event.planSessionId).toBe('plan-1');
  });

  it('ExecutionStageCompletedEvent has stage, duration, status', () => {
    const event = new ExecutionStageCompletedEvent('exec-1', 'character', 150, 'completed');
    expect(event.sessionId).toBe('exec-1');
    expect(event.stage).toBe('character');
    expect(event.durationMs).toBe(150);
    expect(event.status).toBe('completed');
  });

  it('NarrativeExecutionCompletedEvent has title and metrics', () => {
    const event = new NarrativeExecutionCompletedEvent('exec-1', 'The Story', 5000, 1500);
    expect(event.sessionId).toBe('exec-1');
    expect(event.storyTitle).toBe('The Story');
    expect(event.totalDurationMs).toBe(5000);
    expect(event.totalTokens).toBe(1500);
  });

  it('NarrativeExecutionFailedEvent has error', () => {
    const event = new NarrativeExecutionFailedEvent('exec-1', 'API timeout');
    expect(event.sessionId).toBe('exec-1');
    expect(event.error).toBe('API timeout');
  });
});

describe('NarrativeExecutionEngine integration with events', () => {
  it('executes plan and produces result with events pattern', async () => {
    const mockAIRuntime = {
      generate: vi.fn().mockResolvedValue({
        id: 'resp-1', model: 'gpt-4', provider: 'openai',
        messages: [{ role: 'assistant', content: 'Generated content for all agents.' }],
        tokenUsage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
        finishReason: 'stop', latencyMs: 50,
      }),
    } as any;

    const engine = new NarrativeExecutionEngine(mockAIRuntime, { defaultMaxRetries: 1, defaultTimeout: 10000 });

    const events: string[] = [];
    const startedEvent = new NarrativeExecutionStartedEvent('exec-2', 'plan-2');
    events.push(`started:${startedEvent.sessionId}`);

    const result = await engine.execute(makeMockResult(), {}, undefined);
    events.push(`completed:${result.executionReport.status}`);

    const completedEvent = new NarrativeExecutionCompletedEvent(
      result.sessionId,
      result.storyDraft.title,
      result.statistics.totalDurationMs,
      result.statistics.totalTokenUsage.totalTokens,
    );
    events.push(`done:${completedEvent.storyTitle}`);

    expect(events).toContain('started:exec-2');
    expect(events).toContain('completed:completed');
    expect(events).toContain('done:Test');
    expect(result.storyDraft.title).toBe('Test');
    expect(result.executionReport.status).toBe('completed');
    expect(result.executionReport.stages).toBeDefined();
    expect(result.executionReport.stages.length).toBeGreaterThan(0);
  }, 30000);
});
