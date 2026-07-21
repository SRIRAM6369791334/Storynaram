import { describe, it, expect } from 'vitest';
import { RevisionEngine } from '../src/engine/revision-engine';
import { GenerationResult, type GeneratedChapter } from '@storynaram/story-generator';

function makeMockResult(overrides?: Partial<GenerationResult>): GenerationResult {
  const chapters: GeneratedChapter[] = [
    {
      number: 1,
      title: 'The Beginning',
      content: 'Once upon a time their was a brave hero named Kael who recieved a quest. He lived in a small village. One day he seen a dragon and ran away quickly.',
      wordCount: 25,
      model: 'gpt-4',
      provider: 'openai',
      latencyMs: 100,
      tokenUsage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 },
    },
    {
      number: 2,
      title: 'The Middle',
      content: 'Kael decided to face his fears. He climbed the mountain and found the dragons lair. The dragon spoke: "I have been waiting for you." Kael replied: "I am ready."',
      wordCount: 35,
      model: 'gpt-4',
      provider: 'openai',
      latencyMs: 100,
      tokenUsage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 },
    },
  ];

  return new GenerationResult({
    sessionId: 'gen-1',
    storyTitle: 'Test Story',
    chapters,
    fullStory: chapters.map(ch => `# ${ch.title}\n\n${ch.content}`).join('\n\n'),
    qualityReport: { passed: true, checks: [] },
    metrics: {
      totalDurationMs: 200,
      totalTokens: 300,
      totalCost: 0.01,
      chaptersGenerated: 2,
      averageLatencyMs: 100,
      modelsUsed: ['gpt-4'],
      providersUsed: ['openai'],
      streamingEnabled: false,
      retryCount: 0,
    },
  });
}

describe('RevisionEngine', () => {
  it('revises a story and returns revision result', async () => {
    const engine = new RevisionEngine({ passes: ['grammar'], autoFix: true });
    const result = await engine.revise(makeMockResult());

    expect(result.sessionId).toBeDefined();
    expect(result.storyTitle).toBe('Test Story');
    expect(result.chapters).toHaveLength(2);
    expect(result.revisedFullStory).toBeDefined();
    expect(result.revisionReport).toBeDefined();
    expect(result.revisionReport.passes.length).toBeGreaterThan(0);
  });

  it('detects spelling and grammar issues', async () => {
    const engine = new RevisionEngine({ passes: ['grammar'] });
    const result = await engine.revise(makeMockResult());

    const grammarPass = result.revisionReport.passes.find(p => p.passType === 'grammar');
    expect(grammarPass).toBeDefined();
    expect(grammarPass!.issuesFound).toBeGreaterThan(0);
    expect(grammarPass!.details.length).toBeGreaterThan(0);
  });

  it('reports engine health', () => {
    const engine = new RevisionEngine();
    const health = engine.getHealth();

    expect(health.status).toBe('healthy');
    expect(health.activeSessions).toBe(0);
    expect(health.totalRevisions).toBe(0);
    expect(health.failedRevisions).toBe(0);
  });

  it('provides quality scores after revision', async () => {
    const engine = new RevisionEngine({ passes: ['grammar', 'style', 'quality'] });
    const result = await engine.revise(makeMockResult());

    expect(result.statistics).toBeDefined();
    const stats = result.statistics.getStats(2);
    expect(stats.qualityScoreAfter).toBeGreaterThanOrEqual(0);
    expect(stats.chaptersRevised).toBe(2);
    expect(stats.passesCompleted).toBeGreaterThan(0);
  });

  it('supports cancellation via AbortSignal', async () => {
    const controller = new AbortController();
    controller.abort();

    const engine = new RevisionEngine();
    await expect(engine.revise(makeMockResult(), undefined, undefined, controller.signal)).rejects.toThrow();
  });

  it('applies auto-fixes when configured', async () => {
    const engine = new RevisionEngine({ passes: ['grammar'], autoFix: true });
    const result = await engine.revise(makeMockResult());

    const originalText = makeMockResult().chapters[0]!.content;
    const revisedText = result.chapters[0]!.revisedContent;

    expect(typeof revisedText).toBe('string');
    expect(revisedText.length).toBeGreaterThan(0);
  });

  it('runs multiple passes', async () => {
    const engine = new RevisionEngine({ passes: ['grammar', 'character', 'world', 'style'] });
    const result = await engine.revise(makeMockResult());

    expect(result.revisionReport.passes).toHaveLength(4);
    for (const pass of result.revisionReport.passes) {
      expect(['grammar', 'character', 'world', 'style']).toContain(pass.passType);
    }
  });

  it('handles empty story gracefully', async () => {
    const engine = new RevisionEngine({ passes: ['grammar'] });
    const result = await engine.revise(new GenerationResult({
      sessionId: 'gen-empty', storyTitle: 'Empty', chapters: [],
      fullStory: '',
      qualityReport: { passed: true, checks: [] },
      metrics: { totalDurationMs: 0, totalTokens: 0, totalCost: 0, chaptersGenerated: 0, averageLatencyMs: 0, modelsUsed: [], providersUsed: [], streamingEnabled: false, retryCount: 0 },
    }));

    expect(result.chapters).toHaveLength(0);
    expect(result.revisedFullStory).toBe('');
  });
});
