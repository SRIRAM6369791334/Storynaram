import { describe, it, expect } from 'vitest';
import { NovelRenderer } from '../src/renderers/novel-renderer';
import { ScreenplayRenderer } from '../src/renderers/screenplay-renderer';
import { ComicRenderer } from '../src/renderers/comic-renderer';
import { VisualNovelRenderer } from '../src/renderers/visual-novel-renderer';
import { InteractiveFictionRenderer } from '../src/renderers/interactive-fiction-renderer';
import { MarkdownRenderer } from '../src/renderers/markdown-renderer';
import { HTMLRenderer } from '../src/renderers/html-renderer';
import { JSONRenderer } from '../src/renderers/json-renderer';

const chapters = [
  { number: 1, title: 'Chapter One', content: 'The beginning of the story. A hero appeared.' },
  { number: 2, title: 'Chapter Two', content: 'The middle of the story. The hero faced challenges.' },
];

describe('NovelRenderer', () => {
  it('renders chapters in novel format', () => {
    const renderer = new NovelRenderer();
    const result = renderer.render(chapters);

    expect(result.format).toBe('novel');
    expect(result.chapters).toHaveLength(2);
    expect(result.content).toContain('# Chapter One');
    expect(result.content).toContain('# Chapter Two');
  });
});

describe('ScreenplayRenderer', () => {
  it('renders chapters in screenplay format', () => {
    const renderer = new ScreenplayRenderer();
    const result = renderer.render(chapters);

    expect(result.format).toBe('screenplay');
    expect(result.content).toContain('FADE IN');
    expect(result.content).toContain('FADE OUT');
    expect(result.content).toContain('THE END');
  });
});

describe('ComicRenderer', () => {
  it('renders chapters in comic script format', () => {
    const renderer = new ComicRenderer();
    const result = renderer.render(chapters);

    expect(result.format).toBe('comic');
    expect(result.content).toContain('PAGE 1');
    expect(result.content).toContain('PAGE 2');
    expect(result.chapters).toHaveLength(2);
  });
});

describe('VisualNovelRenderer', () => {
  it('renders chapters in visual novel format', () => {
    const renderer = new VisualNovelRenderer();
    const result = renderer.render(chapters);

    expect(result.format).toBe('visual-novel');
    expect(result.content).toContain('@narration');
  });
});

describe('InteractiveFictionRenderer', () => {
  it('renders chapters in interactive fiction format', () => {
    const renderer = new InteractiveFictionRenderer();
    const result = renderer.render(chapters);

    expect(result.format).toBe('interactive-fiction');
    expect(result.content).toContain(':: Chapter One');
    expect(result.content).toContain(':: Chapter Two');
    expect(result.content).toContain('[[Continue');
  });
});

describe('MarkdownRenderer', () => {
  it('renders chapters in markdown format', () => {
    const renderer = new MarkdownRenderer();
    const result = renderer.render(chapters);

    expect(result.format).toBe('markdown');
    expect(result.content).toContain('## Chapter 1: Chapter One');
    expect(result.content).toContain('## Chapter 2: Chapter Two');
  });
});

describe('HTMLRenderer', () => {
  it('renders chapters in HTML format', () => {
    const renderer = new HTMLRenderer();
    const result = renderer.render(chapters);

    expect(result.format).toBe('html');
    expect(result.content).toContain('<!DOCTYPE html>');
    expect(result.content).toContain('<h2>Chapter 1: Chapter One</h2>');
    expect(result.content).toContain('</html>');
  });
});

describe('JSONRenderer', () => {
  it('renders chapters in JSON format', () => {
    const renderer = new JSONRenderer();
    const result = renderer.render(chapters);

    expect(result.format).toBe('json');
    const data = JSON.parse(result.content);
    expect(data.metadata.totalChapters).toBe(2);
    expect(data.chapters).toHaveLength(2);
  });
});
