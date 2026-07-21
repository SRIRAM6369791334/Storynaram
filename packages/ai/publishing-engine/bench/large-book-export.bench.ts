import { bench, describe } from 'vitest';
import { MarkdownExporter } from '../src/exporters/markdown-exporter';
import { HTMLExporter } from '../src/exporters/html-exporter';
import { JSONExporter } from '../src/exporters/json-exporter';
import { TXTExporter } from '../src/exporters/txt-exporter';

const largeContent = Array.from({ length: 100 }, (_, i) =>
  `# Chapter ${i + 1}\n\nThis is the content of chapter ${i + 1} with sufficient text to simulate a real book chapter. The narrative continues with detailed descriptions, dialogue between characters, and advancing plot points.\n\n`.repeat(10)
).join('\n');

const title = 'Large Book Export Test';

describe('Large Book Export Performance', () => {
  bench('markdown export - 100 chapters', () => {
    new MarkdownExporter().export(largeContent, title);
  });

  bench('HTML export - 100 chapters', () => {
    new HTMLExporter().export(largeContent, title);
  });

  bench('JSON export - 100 chapters', () => {
    new JSONExporter().export(largeContent, title);
  });

  bench('TXT export - 100 chapters', () => {
    new TXTExporter().export(largeContent, title);
  });
});
