import { describe, it, expect } from 'vitest';
import { OutputAssembler } from '../src/output/output-assembler';
import type { GeneratedChapter } from '../src/generation-result';

describe('OutputAssembler', () => {
  it('assembles full story from chapters', () => {
    const assembler = new OutputAssembler();
    const chapters: GeneratedChapter[] = [
      { number: 1, title: 'The Beginning', content: 'Once upon a time...', wordCount: 20, model: 'gpt-4', provider: 'openai', latencyMs: 100, tokenUsage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 } },
      { number: 2, title: 'The Middle', content: 'The adventure continues...', wordCount: 20, model: 'gpt-4', provider: 'openai', latencyMs: 100, tokenUsage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 } },
    ];

    const story = assembler.assembleFullStory(chapters);
    expect(story).toContain('Chapter 1: The Beginning');
    expect(story).toContain('Chapter 2: The Middle');
    expect(story).toContain('Once upon a time');
    expect(story).toContain('The adventure continues');
  });

  it('formats chapter header without title prefix', () => {
    const assembler = new OutputAssembler();
    const chapter: GeneratedChapter = { number: 3, title: '3', content: 'Content', wordCount: 5, model: 'gpt-4', provider: 'openai', latencyMs: 100, tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } };

    const result = assembler.assembleChapter(chapter);
    expect(result).toContain('# Chapter 3');
    expect(result).toContain('Content');
  });

  it('extracts content from markdown code blocks', () => {
    const assembler = new OutputAssembler();
    const response = '```markdown\n# Chapter 1\nThe story begins...\n```';

    const extracted = assembler.extractContentFromResponse(response);
    expect(extracted).toBe('# Chapter 1\nThe story begins...');
  });

  it('splits full text into chapters', () => {
    const assembler = new OutputAssembler();
    const text = '# Chapter 1: The Beginning\n\nOnce upon a time...\n\n# Chapter 2: The Middle\n\nThe adventure continues...';

    const chapters = assembler.splitIntoChapters(text);
    expect(chapters).toHaveLength(2);
    expect(chapters[0]!.number).toBe(1);
    expect(chapters[0]!.title).toBe('The Beginning');
    expect(chapters[1]!.number).toBe(2);
    expect(chapters[1]!.title).toBe('The Middle');
  });

  it('calculates word count', () => {
    const assembler = new OutputAssembler();
    const count = assembler.calculateWordCount('The quick brown fox jumps over the lazy dog');
    expect(count).toBe(9);
  });
});
