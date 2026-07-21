import { bench, describe } from 'vitest';
import { PromptAssembler } from '../src/prompt/prompt-assembler';
import { PromptOptimizer } from '../src/prompt/prompt-optimizer';
import type { StoryDraft } from '@storynaram/narrative-execution';

const draft: StoryDraft = {
  title: 'The Long Story', chapters: Array.from({ length: 20 }, (_, i) => ({ number: i + 1, title: `Chapter ${i + 1}`, content: '', wordCount: 0 })),
  characters: Array.from({ length: 10 }, (_, i) => ({ name: `Char ${i}`, role: 'protagonist', introduction: 'A'.repeat(200), dialogue: 'B'.repeat(100), scenes: ['scene1'] })),
  worlds: [{ name: 'World', regions: ['R1', 'R2'], description: 'C'.repeat(500) }],
  timeline: { events: Array.from({ length: 10 }, (_, i) => ({ date: `Year ${i}`, title: `Event ${i}`, narrative: 'D'.repeat(100) })), overallTimeline: 'E'.repeat(200) },
  narrative: { synopsis: 'F'.repeat(300), chapters: [] },
  composition: { arcs: Array.from({ length: 5 }, (_, i) => ({ name: `Arc ${i}`, content: 'G'.repeat(100) })), overallStructure: 'H'.repeat(200) },
  validationResults: [], metadata: { genre: ['fantasy'] },
};

describe('Prompt Assembly Benchmarks', () => {
  bench('assemble chapter prompt', () => {
    const assembler = new PromptAssembler();
    assembler.assembleChapterPrompt(draft, draft.chapters[0]!, '');
  });

  bench('assemble full story prompt', () => {
    const assembler = new PromptAssembler();
    assembler.assembleFullStoryPrompt(draft);
  });

  bench('optimize large prompt', () => {
    const optimizer = new PromptOptimizer();
    optimizer.optimize({ systemPrompt: 'X'.repeat(10000), userPrompt: 'Y'.repeat(50000), estimatedTokens: 15000 }, 4000);
  });
});
