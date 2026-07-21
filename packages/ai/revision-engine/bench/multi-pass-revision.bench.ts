import { bench, describe } from 'vitest';
import { RevisionEngine } from '../src/engine/revision-engine';
import { GenerationResult, type GeneratedChapter } from '@storynaram/story-generator';

function makeResult(): GenerationResult {
  const chapters: GeneratedChapter[] = [
    { number: 1, title: 'Chapter 1', content: 'Their was a hero named Kael who recieved a quest.', wordCount: 10, model: 'gpt-4', provider: 'openai', latencyMs: 100, tokenUsage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 } },
    { number: 2, title: 'Chapter 2', content: 'Kael definately wanted to complete the mission.', wordCount: 8, model: 'gpt-4', provider: 'openai', latencyMs: 100, tokenUsage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 } },
  ];

  return new GenerationResult({
    sessionId: 'bench-gen', storyTitle: 'Bench Story', chapters,
    fullStory: chapters.map(ch => `# ${ch.title}\n\n${ch.content}`).join('\n\n'),
    qualityReport: { passed: true, checks: [] },
    metrics: { totalDurationMs: 200, totalTokens: 300, totalCost: 0, chaptersGenerated: 2, averageLatencyMs: 100, modelsUsed: ['gpt-4'], providersUsed: ['openai'], streamingEnabled: false, retryCount: 0 },
  });
}

describe('Multi-Pass Revision Performance', () => {
  bench('single-pass grammar revision', async () => {
    const engine = new RevisionEngine({ passes: ['grammar'] });
    await engine.revise(makeResult());
  }, { iterations: 10 });

  bench('three-pass revision (grammar, character, style)', async () => {
    const engine = new RevisionEngine({ passes: ['grammar', 'character', 'style'] });
    await engine.revise(makeResult());
  }, { iterations: 10 });

  bench('all-passes revision', async () => {
    const engine = new RevisionEngine({ passes: ['grammar', 'character', 'world', 'timeline', 'canon', 'narrative', 'plot', 'style', 'quality'] });
    await engine.revise(makeResult());
  }, { iterations: 5 });
});
