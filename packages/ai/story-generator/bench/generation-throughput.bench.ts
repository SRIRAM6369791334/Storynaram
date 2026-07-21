import { bench, describe } from 'vitest';
import { PromptAssembler } from '../src/prompt/prompt-assembler';
import { OutputAssembler } from '../src/output/output-assembler';
import type { ChapterDraft, StoryDraft } from '@storynaram/narrative-execution';
import type { GeneratedChapter } from '../src/';

const draft: StoryDraft = {
  title: 'Bench', chapters: Array.from({ length: 10 }, (_, i) => ({ number: i + 1, title: `Ch${i + 1}`, content: '', wordCount: 0 })),
  characters: [{ name: 'Hero', role: 'protagonist', introduction: 'Intro', dialogue: 'Dialogue', scenes: ['s1'] }],
  worlds: [{ name: 'W', regions: ['R'], description: 'Desc' }],
  timeline: { events: [{ date: 'Y1', title: 'E1', narrative: '' }], overallTimeline: 'T' },
  narrative: { synopsis: 'S', chapters: [] },
  composition: { arcs: [{ name: 'A1', content: '' }], overallStructure: '' },
  validationResults: [], metadata: {},
};

const chapters: GeneratedChapter[] = Array.from({ length: 10 }, (_, i) => ({
  number: i + 1, title: `Chapter ${i + 1}`, content: 'X'.repeat(5000), wordCount: 5000 / 5,
  model: 'gpt-4', provider: 'openai', latencyMs: 1000,
  tokenUsage: { inputTokens: 100, outputTokens: 1000, totalTokens: 1100 },
}));

describe('Generation Throughput Benchmarks', () => {
  bench('build chapter prompts for 10 chapters', () => {
    const assembler = new PromptAssembler();
    for (const ch of draft.chapters) {
      assembler.assembleChapterPrompt(draft, ch, '');
    }
  });

  bench('assemble full story from 10 chapters', () => {
    const assembler = new OutputAssembler();
    assembler.assembleFullStory(chapters);
  });

  bench('extract content from response', () => {
    const assembler = new OutputAssembler();
    assembler.extractContentFromResponse('```markdown\n# Chapter 1\n\nContent...\n```');
  });

  bench('split into chapters (10 chapters)', () => {
    const assembler = new OutputAssembler();
    const text = chapters.map(ch => `# Chapter ${ch.number}: ${ch.title}\n\n${ch.content}`).join('\n\n');
    assembler.splitIntoChapters(text);
  });
});
