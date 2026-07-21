import { describe, it, expect } from 'vitest';
import { PromptAssembler } from '../src/prompt/prompt-assembler';
import type { StoryDraft, ChapterDraft, CharacterProse, WorldProse, TimelineProse, NarrativeProse, CompositionProse } from '@storynaram/narrative-execution';

function makeMockDraft(): StoryDraft {
  return {
    title: 'The Last Kingdom',
    chapters: [{ number: 1, title: 'The Beginning', content: '', wordCount: 0 }],
    characters: [{ name: 'Kael', role: 'protagonist', introduction: 'A brave warrior', dialogue: 'I will fight', scenes: ['forest'] }],
    worlds: [{ name: 'Eldoria', regions: ['Northern Plains'], description: 'A vast realm of magic' }],
    timeline: { events: [{ date: 'Year 1', title: 'Call', narrative: 'Hero begins journey' }], overallTimeline: 'A tale of redemption' },
    narrative: { synopsis: 'A story of redemption', chapters: [] },
    composition: { arcs: [{ name: 'Rise', content: 'Hero rises' }], overallStructure: 'Three-act' },
    validationResults: [],
    metadata: { genre: ['fantasy'], themes: ['redemption'] },
  };
}

describe('PromptAssembler', () => {
  it('assembles a chapter prompt', () => {
    const assembler = new PromptAssembler();
    const draft = makeMockDraft();
    const chapter = draft.chapters[0]!;

    const result = assembler.assembleChapterPrompt(draft, chapter, '');

    expect(result.systemPrompt).toContain('fiction writer');
    expect(result.userPrompt).toContain('CHAPTER 1');
    expect(result.userPrompt).toContain('The Beginning');
    expect(result.userPrompt).toContain('Kael');
    expect(result.userPrompt).toContain('Eldoria');
    expect(result.estimatedTokens).toBeGreaterThan(0);
  });

  it('includes previous chapter content when provided', () => {
    const assembler = new PromptAssembler();
    const draft = makeMockDraft();
    const chapter = draft.chapters[0]!;

    const result = assembler.assembleChapterPrompt(draft, chapter, 'Previous chapter text...');

    expect(result.userPrompt).toContain('PREVIOUS CHAPTER');
    expect(result.userPrompt).toContain('Previous chapter text...');
  });

  it('assembles full story prompt', () => {
    const assembler = new PromptAssembler();
    const draft = makeMockDraft();

    const result = assembler.assembleFullStoryPrompt(draft);

    expect(result.systemPrompt).toContain('award-winning novelist');
    expect(result.userPrompt).toContain('The Last Kingdom');
    expect(result.userPrompt).toContain('CHAPTER OUTLINES');
    expect(result.userPrompt).toContain('COMPOSITION ARCS');
  });

  it('respects context include options', () => {
    const assembler = new PromptAssembler();
    const draft = makeMockDraft();
    const chapter = draft.chapters[0]!;

    const result = assembler.assembleChapterPrompt(draft, chapter, '', {
      includeCharacterContext: false,
      includeWorldContext: false,
    });

    expect(result.userPrompt).not.toContain('Kael');
    expect(result.userPrompt).not.toContain('Eldoria');
  });

  it('estimates tokens correctly', () => {
    const assembler = new PromptAssembler();
    const text = 'Hello world this is a test sentence with about twenty five tokens total';
    const tokens = (assembler as any).estimateTokens(text);
    expect(tokens).toBeGreaterThan(0);
  });
});
