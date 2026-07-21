import { describe, it, expect } from 'vitest';
import { RevisionEngine } from '../src/engine/revision-engine';
import { reviseStory, RevisionStartedEvent, RevisionCompletedEvent } from '../src/integration';
import { GenerationResult, type GeneratedChapter } from '@storynaram/story-generator';
import type { ExecutionResult } from '@storynaram/narrative-execution';

function makeMockResult(): GenerationResult {
  const chapters: GeneratedChapter[] = [
    { number: 1, title: 'Ch1', content: 'A brave hero started their adventure thier resolve was strong.', wordCount: 10, model: 'gpt-4', provider: 'openai', latencyMs: 100, tokenUsage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 } },
    { number: 2, title: 'Ch2', content: 'The hero faced many challenges but never gave up.', wordCount: 10, model: 'gpt-4', provider: 'openai', latencyMs: 100, tokenUsage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 } },
  ];

  return new GenerationResult({
    sessionId: 'gen-1',
    storyTitle: 'Test Story',
    chapters,
    fullStory: chapters.map(ch => `# ${ch.title}\n\n${ch.content}`).join('\n\n'),
    qualityReport: { passed: true, checks: [] },
    metrics: {
      totalDurationMs: 200, totalTokens: 300, totalCost: 0.01, chaptersGenerated: 2,
      averageLatencyMs: 100, modelsUsed: ['gpt-4'], providersUsed: ['openai'],
      streamingEnabled: false, retryCount: 0,
    },
  });
}

describe('Integration', () => {
  it('reviseStory function works', async () => {
    const engine = new RevisionEngine({ passes: ['grammar'] });
    const result = await reviseStory(engine, makeMockResult());

    expect(result.sessionId).toBeDefined();
    expect(result.revisionReport).toBeDefined();
  });

  it('creates RevisionStartedEvent', () => {
    const event = new RevisionStartedEvent('s-1', 'Test', 2, ['grammar']);

    expect(event.sessionId).toBe('s-1');
    expect(event.storyTitle).toBe('Test');
    expect(event.chapterCount).toBe(2);
    expect(event.passes).toEqual(['grammar']);
  });

  it('creates RevisionCompletedEvent', () => {
    const event = new RevisionCompletedEvent('s-1', 'Test', 2, 5, 3, 60, 80);

    expect(event.sessionId).toBe('s-1');
    expect(event.totalIssuesFound).toBe(5);
    expect(event.totalIssuesResolved).toBe(3);
    expect(event.overallQualityBefore).toBe(60);
    expect(event.overallQualityAfter).toBe(80);
  });

  it('engine can revise with execution result', async () => {
    const engine = new RevisionEngine({ passes: ['grammar'] });
    const genResult = makeMockResult();
    const execResult: ExecutionResult = null as unknown as ExecutionResult;

    const result = await engine.revise(genResult, execResult, { autoFix: true });
    expect(result.revisionReport).toBeDefined();
  });
});
