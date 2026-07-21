import { describe, it, expect } from 'vitest';
import { MetadataGenerator } from '../src/metadata/metadata-generator';
import { CoverGenerator } from '../src/cover/cover-generator';

describe('MetadataGenerator', () => {
  const generator = new MetadataGenerator();

  it('generates metadata package', () => {
    const metadata = generator.generate({
      title: 'Test Story',
      author: 'Test Author',
      genre: ['fantasy'],
      tags: ['adventure'],
    });

    expect(metadata.title).toBe('Test Story');
    expect(metadata.author).toBe('Test Author');
    expect(metadata.genre).toEqual(['fantasy']);
    expect(metadata.language).toBe('en');
    expect(metadata.publicationDate).toBeDefined();
  });

  it('generates cover metadata', () => {
    const cover = generator.generateCover({
      title: 'Test Story',
      author: 'Test Author',
      series: 'Series Name',
      volume: 1,
    });

    expect(cover.title).toBe('Test Story');
    expect(cover.series).toBe('Series Name');
    expect(cover.volume).toBe(1);
    expect(cover.spine).toContain('Series Name');
  });

  it('generates HTML metadata', () => {
    const metadata = generator.generate({ title: 'Test', author: 'Author' });
    const html = generator.generateHTMLMetadata(metadata);

    expect(html).toContain('Test');
    expect(html).toContain('Author');
    expect(html).toContain('Storynaram');
  });

  it('generates JSON metadata', () => {
    const metadata = generator.generate({ title: 'Test', author: 'Author' });
    const json = generator.generateJSONMetadata(metadata);

    const parsed = JSON.parse(json);
    expect(parsed.title).toBe('Test');
    expect(parsed.author).toBe('Author');
  });

  it('handles minimal input', () => {
    const metadata = generator.generate({ title: 'Minimal' });

    expect(metadata.title).toBe('Minimal');
    expect(metadata.author).toBe('Unknown Author');
    expect(metadata.genre).toEqual([]);
  });
});

describe('CoverGenerator', () => {
  const generator = new CoverGenerator();

  it('generates cover text', () => {
    const cover = generator.generateCoverText({
      title: 'Test Story',
      author: 'Test Author',
      subtitle: 'A Great Tale',
    });

    expect(cover).toContain('TEST STORY');
    expect(cover).toContain('Test Author');
    expect(cover).toContain('A Great Tale');
  });

  it('generates HTML cover', () => {
    const html = generator.generateHTMLCover({
      title: 'Test Story',
      author: 'Test Author',
    });

    expect(html).toContain('Test Story');
    expect(html).toContain('Test Author');
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('generates spine text', () => {
    const spine = generator.generateSpineText({
      title: 'Test Story',
      author: 'Test Author',
      series: 'Series',
    });

    expect(spine).toContain('Test Story');
    expect(spine.length).toBeLessThanOrEqual(20);
  });

  it('generates back cover text', () => {
    const back = generator.generateBackCoverText({
      title: 'Test',
      author: 'Author',
      backCover: 'An exciting tale of adventure.',
    });

    expect(back).toContain('An exciting tale');
    expect(back).toContain('Author');
  });
});
