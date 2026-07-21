import { describe, it, expect, vi } from 'vitest';
import { generateStory, GenerationStartedEvent, ChapterGeneratedEvent, GenerationCompletedEvent, GenerationFailedEvent } from '../src/integration';
import { StoryGenerationEngine } from '../src/story-generation-engine';
import { ExecutionResult, type StoryDraft } from '@storynaram/narrative-execution';

function makeMockResult(): ExecutionResult {
  const draft: StoryDraft = {
    title: 'Integration Test',
    chapters: [{ number: 1, title: 'Ch1', content: '', wordCount: 0 }],
    characters: [], worlds: [],
    timeline: { events: [], overallTimeline: '' },
    narrative: { synopsis: 'Test', chapters: [] },
    composition: { arcs: [], overallStructure: '' },
    validationResults: [], metadata: {},
  };
  return new (class extends ExecutionResult {
    constructor() {
      super({
        sessionId: 'exec-1', storyDraft: draft,
        executionReport: { sessionId: 'exec-1', status: 'completed', stages: [], totalDurationMs: 0, totalTokens: 0, model: 'gpt-4' },
        validationReport: { passed: true, validations: [], summary: '' },
        statistics: { totalTasks: 1, completedTasks: 1, failedTasks: 0, totalDurationMs: 0, totalTokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }, agentTimings: [], stageTimings: [] },
      });
    }
  })();
}

describe('Integration', () => {
  it('generateStory calls engine.generate', async () => {
    const mockEngine = { generate: vi.fn().mockResolvedValue({ sessionId: 'gen-1', storyTitle: 'Test', chapters: [], fullStory: '', qualityReport: { passed: true, checks: [] }, metrics: { totalDurationMs: 0, totalTokens: 0, totalCost: 0, chaptersGenerated: 0, averageLatencyMs: 0, modelsUsed: [], providersUsed: [], streamingEnabled: false, retryCount: 0 }, completedAt: new Date() }) } as any;

    const result = await generateStory(mockEngine, makeMockResult(), { model: 'gpt-4' });
    expect(mockEngine.generate).toHaveBeenCalledTimes(1);
    expect(result.sessionId).toBe('gen-1');
  });

  it('GenerationStartedEvent has sessionId and executionSessionId', () => {
    const event = new GenerationStartedEvent('gen-1', 'exec-1', 5);
    expect(event.sessionId).toBe('gen-1');
    expect(event.executionSessionId).toBe('exec-1');
    expect(event.chapterCount).toBe(5);
  });

  it('ChapterGeneratedEvent has chapter details', () => {
    const event = new ChapterGeneratedEvent('gen-1', 2, 1500, 300);
    expect(event.sessionId).toBe('gen-1');
    expect(event.chapterNumber).toBe(2);
    expect(event.wordCount).toBe(1500);
    expect(event.latencyMs).toBe(300);
  });

  it('GenerationCompletedEvent has metrics', () => {
    const event = new GenerationCompletedEvent('gen-1', 'Story', 10, 5000, 0.15);
    expect(event.sessionId).toBe('gen-1');
    expect(event.storyTitle).toBe('Story');
    expect(event.totalChapters).toBe(10);
    expect(event.totalTokens).toBe(5000);
    expect(event.totalCost).toBe(0.15);
  });

  it('GenerationFailedEvent has error', () => {
    const event = new GenerationFailedEvent('gen-1', 'Provider unavailable');
    expect(event.sessionId).toBe('gen-1');
    expect(event.error).toBe('Provider unavailable');
  });

  it('full flow: execution result -> engine -> generation result', async () => {
    const mockAIRuntime = {
      generate: vi.fn().mockResolvedValue({
        id: 'resp-1', model: 'gpt-4', provider: 'openai',
        messages: [{ role: 'assistant', content: 'Generated story content for integration test.' }],
        tokenUsage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 },
        finishReason: 'stop', latencyMs: 100,
      }),
    } as any;

    const engine = new StoryGenerationEngine(mockAIRuntime, { defaultMaxTokens: 1000 });

    const startedEvent = new GenerationStartedEvent('gen-2', 'exec-2', 1);
    expect(startedEvent.chapterCount).toBe(1);

    const result = await engine.generate(makeMockResult());

    const completedEvent = new GenerationCompletedEvent(
      result.sessionId,
      result.storyTitle,
      result.chapters.length,
      result.metrics.totalTokens,
      result.metrics.totalCost,
    );

    expect(completedEvent.storyTitle).toBe('Integration Test');
    expect(result.chapters).toHaveLength(1);
    expect(result.qualityReport.passed).toBeDefined();
  }, 15000);
});
