import { describe, it, expect } from 'vitest';
import { PDFExporter } from '../src/exporters/pdf-exporter';
import { EPUBExporter } from '../src/exporters/epub-exporter';
import { DOCXExporter } from '../src/exporters/docx-exporter';
import { MarkdownExporter } from '../src/exporters/markdown-exporter';
import { HTMLExporter } from '../src/exporters/html-exporter';
import { JSONExporter } from '../src/exporters/json-exporter';
import { TXTExporter } from '../src/exporters/txt-exporter';
import { ZIPExporter } from '../src/exporters/zip-exporter';

const content = 'Test content for export.';
const title = 'Test Story';

describe('PDFExporter', () => {
  it('exports to PDF format', () => {
    const exporter = new PDFExporter();
    const result = exporter.export(content, title);

    expect(result.format).toBe('pdf');
    expect(result.mimeType).toBe('application/pdf');
    expect(result.filename).toContain('.pdf');
    expect(result.content.length).toBeGreaterThan(0);
  });
});

describe('EPUBExporter', () => {
  it('exports to EPUB format', () => {
    const exporter = new EPUBExporter();
    const result = exporter.export(content, title);

    expect(result.format).toBe('epub');
    expect(result.mimeType).toBe('application/epub+zip');
    expect(result.filename).toContain('.epub');
    expect(result.content).toContain('package');
    expect(result.content).toContain(title);
  });
});

describe('DOCXExporter', () => {
  it('exports to DOCX format', () => {
    const exporter = new DOCXExporter();
    const result = exporter.export(content, title);

    expect(result.format).toBe('docx');
    expect(result.filename).toContain('.docx');
    expect(result.content).toContain('w:document');
    expect(result.content).toContain(title);
  });
});

describe('MarkdownExporter', () => {
  it('exports to Markdown format', () => {
    const exporter = new MarkdownExporter();
    const result = exporter.export(content, title);

    expect(result.format).toBe('markdown');
    expect(result.filename).toContain('.md');
    expect(result.content).toContain('# Test Story');
    expect(result.content).toContain(content);
  });
});

describe('HTMLExporter', () => {
  it('exports to HTML format', () => {
    const exporter = new HTMLExporter();
    const result = exporter.export(content, title);

    expect(result.format).toBe('html');
    expect(result.filename).toContain('.html');
    expect(result.content).toContain('<!DOCTYPE html>');
    expect(result.content).toContain('<h1>Test Story</h1>');
  });
});

describe('JSONExporter', () => {
  it('exports to JSON format', () => {
    const exporter = new JSONExporter();
    const result = exporter.export(content, title);

    expect(result.format).toBe('json');
    expect(result.filename).toContain('.json');
    const data = JSON.parse(result.content);
    expect(data.title).toBe(title);
  });
});

describe('TXTExporter', () => {
  it('exports to TXT format', () => {
    const exporter = new TXTExporter();
    const result = exporter.export(content, title);

    expect(result.format).toBe('txt');
    expect(result.filename).toContain('.txt');
    expect(result.content).toContain('Test Story');
    expect(result.content).toContain('====');
  });
});

describe('ZIPExporter', () => {
  it('exports to ZIP format', () => {
    const exporter = new ZIPExporter();
    const result = exporter.export(JSON.stringify([{ name: 'test.txt', content: 'test' }]), title);

    expect(result.format).toBe('zip');
    expect(result.filename).toContain('.zip');
    expect(result.mimeType).toBe('application/zip');
  });
});
