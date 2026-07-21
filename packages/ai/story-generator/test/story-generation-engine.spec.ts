import { describe, it, expect, vi } from 'vitest';
import { StoryGenerationEngine } from '../src/story-generation-engine';
import { ExecutionResult, type StoryDraft } from '@storynaram/narrative-execution';

function makeMockResult(): ExecutionResult {
  const draft: StoryDraft = {
    title: 'Test Story',
    chapters: [
      { number: 1, title: 'The Beginning', content: '', wordCount: 0 },
      { number: 2, title: 'The Middle', content: '', wordCount: 0 },
    ],
    characters: [{ name: 'Hero', role: 'protagonist', introduction: 'A brave soul', dialogue: 'I am ready', scenes: ['forest'] }],
    worlds: [{ name: 'World', regions: ['North'], description: 'A vast world of adventure' }],
    timeline: { events: [{ date: 'Year 1', title: 'Start', narrative: 'The journey begins' }], overallTimeline: 'Epic tale' },
    narrative: { synopsis: 'An epic story of courage', chapters: [] },
    composition: { arcs: [{ name: 'Rise', content: 'Hero rises to the challenge' }], overallStructure: 'Three-act' },
    validationResults: [],
    metadata: { genre: ['fantasy'], themes: ['courage'] },
  };
  return new (class extends ExecutionResult {
    constructor() {
      super({
        sessionId: 'exec-1', storyDraft: draft,
        executionReport: { sessionId: 'exec-1', status: 'completed', stages: [], totalDurationMs: 100, totalTokens: 0, model: 'gpt-4' },
        validationReport: { passed: true, validations: [], summary: '' },
        statistics: { totalTasks: 1, completedTasks: 1, failedTasks: 0, totalDurationMs: 100, totalTokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }, agentTimings: [], stageTimings: [] },
      });
    }
  })();
}

describe('StoryGenerationEngine', () => {
  it('generates a story from execution result', async () => {
    const mockAIRuntime = {
      generate: vi.fn().mockResolvedValue({
        id: 'resp-1', model: 'gpt-4-turbo', provider: 'openai',
        messages: [{ role: 'assistant', content: 'Once upon a time in a magical land, there lived a brave hero named Kael...' }],
        tokenUsage: { inputTokens: 100, outputTokens: 200, totalTokens: 300 },
        finishReason: 'stop', latencyMs: 500,
      }),
    } as any;

    const engine = new StoryGenerationEngine(mockAIRuntime, {
      defaultModel: 'gpt-4-turbo',
      defaultTemperature: 0.8,
      generateSequentially: true,
    });

    const result = await engine.generate(makeMockResult());

    expect(result.sessionId).toBeDefined();
    expect(result.storyTitle).toBe('Test Story');
    expect(result.chapters).toHaveLength(2);
    expect(result.chapters[0]!.number).toBe(1);
    expect(result.chapters[0]!.title).toBe('The Beginning');
    expect(result.chapters[0]!.content).toBeTruthy();
    expect(result.chapters[1]!.number).toBe(2);
    expect(result.fullStory).toContain('Chapter 1: The Beginning');
    expect(result.fullStory).toContain('Chapter 2: The Middle');
    expect(result.qualityReport).toBeDefined();
    expect(result.qualityReport.checks.length).toBeGreaterThan(0);
    expect(result.metrics.chaptersGenerated).toBe(2);
    expect(result.metrics.totalTokens).toBeGreaterThan(0);
  }, 15000);

  it('reports engine health', () => {
    const engine = new StoryGenerationEngine({} as any);
    const health = engine.getHealth();

    expect(health.status).toBe('healthy');
    expect(health.activeSessions).toBe(0);
    expect(health.totalGenerations).toBe(0);
    expect(health.failedGenerations).toBe(0);
  });

  it('supports parallel chapter generation', async () => {
    const mockAIRuntime = {
      generate: vi.fn().mockResolvedValue({
        id: 'resp-1', model: 'gpt-4', provider: 'openai',
        messages: [{ role: 'assistant', content: 'Generated chapter content...' }],
        tokenUsage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 },
        finishReason: 'stop', latencyMs: 100,
      }),
    } as any;

    const engine = new StoryGenerationEngine(mockAIRuntime, {
      generateSequentially: false,
      maxConcurrentChapters: 2,
    });

    const result = await engine.generate(makeMockResult());
    expect(result.chapters).toHaveLength(2);
  }, 15000);

  it('handles AI failures gracefully with retry', async () => {
    const mockAIRuntime = {
      generate: vi.fn()
        .mockRejectedValueOnce(new Error('API error'))
        .mockRejectedValueOnce(new Error('API error'))
        .mockResolvedValue({
          id: 'resp-1', model: 'gpt-4', provider: 'openai',
          messages: [{ role: 'assistant', content: 'Content after retry' }],
          tokenUsage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 },
          finishReason: 'stop', latencyMs: 100,
        }),
    } as any;

    const engine = new StoryGenerationEngine(mockAIRuntime, {
      defaultModel: 'gpt-4-turbo',
      defaultRetryCount: 3,
    });

    const result = await engine.generate(makeMockResult());
    expect(result.chapters[0]!.content).toBe('Content after retry');
  }, 15000);

  it('supports cancellation via AbortSignal', async () => {
    const controller = new AbortController();
    controller.abort();

    const engine = new StoryGenerationEngine({} as any);
    await expect(engine.generate(makeMockResult(), {}, controller.signal)).rejects.toThrow();
  });

  it('produces quality report', async () => {
    const mockAIRuntime = {
      generate: vi.fn().mockResolvedValue({
        id: 'resp-1', model: 'gpt-4', provider: 'openai',
        messages: [{ role: 'assistant', content: 'A'.repeat(500) }],
        tokenUsage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 },
        finishReason: 'stop', latencyMs: 100,
      }),
    } as any;

    const engine = new StoryGenerationEngine(mockAIRuntime);
    const result = await engine.generate(makeMockResult());

    expect(result.qualityReport.checks.some(c => c.name === 'WordCount')).toBe(true);
    expect(result.qualityReport.checks.some(c => c.name === 'ChapterCount')).toBe(true);
    expect(result.qualityReport.checks.some(c => c.name === 'ContentQuality')).toBe(true);
  }, 15000);
});
