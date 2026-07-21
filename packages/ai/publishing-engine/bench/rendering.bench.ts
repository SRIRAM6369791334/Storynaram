import { bench, describe } from 'vitest';
import { NovelRenderer } from '../src/renderers/novel-renderer';
import { ScreenplayRenderer } from '../src/renderers/screenplay-renderer';
import { MarkdownRenderer } from '../src/renderers/markdown-renderer';
import { HTMLRenderer } from '../src/renderers/html-renderer';
import { JSONRenderer } from '../src/renderers/json-renderer';

const chapters = Array.from({ length: 10 }, (_, i) => ({
  number: i + 1,
  title: `Chapter ${i + 1}`,
  content: `This is the content of chapter ${i + 1}. It contains multiple sentences that describe the story. The hero continues their journey through various challenges and adventures.`.repeat(5),
}));

describe('Rendering Performance', () => {
  bench('novel renderer - 10 chapters', () => {
    new NovelRenderer().render(chapters);
  });

  bench('screenplay renderer - 10 chapters', () => {
    new ScreenplayRenderer().render(chapters);
  });

  bench('markdown renderer - 10 chapters', () => {
    new MarkdownRenderer().render(chapters);
  });

  bench('HTML renderer - 10 chapters', () => {
    new HTMLRenderer().render(chapters);
  });

  bench('JSON renderer - 10 chapters', () => {
    new JSONRenderer().render(chapters);
  });
});
