import { describe, it, expect } from 'vitest';
import { TOCGenerator } from '../src/toc/toc-generator';

describe('TOCGenerator', () => {
  const generator = new TOCGenerator();
  const chapters = [
    { number: 1, title: 'The Beginning' },
    { number: 2, title: 'The Middle' },
    { number: 3, title: 'The End' },
  ];

  it('generates TOC entries', () => {
    const entries = generator.generateTOC(chapters);

    expect(entries).toHaveLength(3);
    expect(entries[0]!.title).toContain('The Beginning');
    expect(entries[2]!.title).toContain('The End');
  });

  it('generates full TOC string', () => {
    const toc = generator.generateFullTOC('Test Story', chapters);

    expect(toc).toContain('Test Story');
    expect(toc).toContain('Table of Contents');
    expect(toc).toContain('Chapter 1: The Beginning');
    expect(toc).toContain('Chapter 3: The End');
  });

  it('generates index options', () => {
    const toc = generator.generateFullTOC('Test', chapters, {
      includeChapterIndex: true,
      includeCharacterIndex: true,
      includeLocationIndex: true,
      includeTimelineIndex: true,
    });

    expect(toc).toContain('Chapter Index');
    expect(toc).toContain('Character Index');
    expect(toc).toContain('Location Index');
    expect(toc).toContain('Timeline Index');
  });

  it('generates book TOC', () => {
    const toc = generator.generateBookTOC(chapters);

    expect(toc).toContain('Table of Contents');
    expect(toc).toContain('1. The Beginning');
    expect(toc).toContain('2. The Middle');
    expect(toc).toContain('3. The End');
  });

  it('counts TOC entries', () => {
    expect(generator.countTOCEntries(chapters)).toBe(3);
    expect(generator.countTOCEntries([])).toBe(0);
  });

  it('handles empty chapters', () => {
    const entries = generator.generateTOC([]);
    expect(entries).toHaveLength(0);

    const toc = generator.generateFullTOC('Empty', []);
    expect(toc).toContain('Empty');
    expect(toc).not.toContain('Chapter');
  });
});
