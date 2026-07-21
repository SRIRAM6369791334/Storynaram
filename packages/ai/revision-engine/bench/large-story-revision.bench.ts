import { bench, describe } from 'vitest';
import { RevisionEngine } from '../src/engine/revision-engine';
import { GenerationResult, type GeneratedChapter } from '@storynaram/story-generator';

function makeLargeStory(chapterCount: number): GenerationResult {
  const chapters: GeneratedChapter[] = Array.from({ length: chapterCount }, (_, i) => ({
    number: i + 1,
    title: `Chapter ${i + 1}`,
    content: `Their was a time when heroes roamed the land. Kael recieved a new quest and definately would succeed. The adventure continued through many trials.`.repeat(10),
    wordCount: 30 * 10,
    model: 'gpt-4', provider: 'openai', latencyMs: 100,
    tokenUsage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 },
  }));

  return new GenerationResult({
    sessionId: 'large-bench', storyTitle: 'Large Story', chapters,
    fullStory: chapters.map(ch => `# ${ch.title}\n\n${ch.content}`).join('\n\n'),
    qualityReport: { passed: true, checks: [] },
    metrics: { totalDurationMs: 200, totalTokens: 300, totalCost: 0, chaptersGenerated: chapterCount, averageLatencyMs: 100, modelsUsed: ['gpt-4'], providersUsed: ['openai'], streamingEnabled: false, retryCount: 0 },
  });
}

describe('Large Story Revision Performance', () => {
  bench('5 chapters - grammar pass', async () => {
    const engine = new RevisionEngine({ passes: ['grammar'] });
    await engine.revise(makeLargeStory(5));
  }, { iterations: 5 });

  bench('10 chapters - grammar pass', async () => {
    const engine = new RevisionEngine({ passes: ['grammar'] });
    await engine.revise(makeLargeStory(10));
  }, { iterations: 5 });

  bench('3 chapters - all passes', async () => {
    const engine = new RevisionEngine({ passes: ['grammar', 'character', 'world', 'timeline', 'canon', 'narrative', 'plot', 'style', 'quality'] });
    await engine.revise(makeLargeStory(3));
  }, { iterations: 3 });
});
