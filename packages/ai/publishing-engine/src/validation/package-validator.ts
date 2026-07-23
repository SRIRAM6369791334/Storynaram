import type { ValidationReport, ValidationCheck } from '../types/publishing-report.js';

export interface ValidationInput {
  chapters: Array<{ number: number; title: string; content: string }>;
  renderedFormats: string[];
  exportedFormats: string[];
  tocEntries: number;
  metadataPresent: boolean;
}

export class PackageValidator {
  validate(input: ValidationInput): ValidationReport {
    const checks: ValidationCheck[] = [];

    checks.push(this.checkBrokenLinks(input.chapters));
    checks.push(this.checkMissingChapters(input.chapters));
    checks.push(this.checkDuplicateChapters(input.chapters));
    checks.push(this.checkMetadataPresence(input.metadataPresent));
    checks.push(this.checkTOCValidity(input.tocEntries, input.chapters.length));
    checks.push(this.checkRenderedFormats(input.renderedFormats));
    checks.push(this.checkExportedFormats(input.exportedFormats));

    return {
      passed: checks.every(c => c.passed),
      checks,
    };
  }

  private checkBrokenLinks(chapters: Array<{ number: number; title: string; content: string }>): ValidationCheck {
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let brokenCount = 0;

    for (const chapter of chapters) {
      let match: RegExpExecArray | null;
      while ((match = linkPattern.exec(chapter.content)) !== null) {
        const url = match[2]!;
        if (url.startsWith('http') && !url.startsWith('https://')) {
          brokenCount++;
        }
      }
    }

    return {
      name: 'BrokenLinks',
      passed: brokenCount === 0,
      severity: brokenCount > 0 ? 'high' : 'low',
      details: brokenCount > 0 ? `Found ${brokenCount} potentially broken link(s)` : 'No broken links detected',
    };
  }

  private checkMissingChapters(chapters: Array<{ number: number; title: string; content: string }>): ValidationCheck {
    if (chapters.length === 0) {
      return { name: 'MissingChapters', passed: false, severity: 'high', details: 'No chapters found' };
    }

    const expected = chapters.map(c => c.number).sort((a, b) => a - b);
    const missing: number[] = [];
    for (let i = expected[0]!; i <= expected[expected.length - 1]!; i++) {
      if (!expected.includes(i)) missing.push(i);
    }

    return {
      name: 'MissingChapters',
      passed: missing.length === 0,
      severity: missing.length > 0 ? 'high' : 'low',
      details: missing.length > 0 ? `Missing chapter(s): ${missing.join(', ')}` : 'All chapters present',
    };
  }

  private checkDuplicateChapters(chapters: Array<{ number: number; title: string; content: string }>): ValidationCheck {
    const seen = new Set<number>();
    const duplicates: number[] = [];

    for (const chapter of chapters) {
      if (seen.has(chapter.number)) {
        duplicates.push(chapter.number);
      }
      seen.add(chapter.number);
    }

    return {
      name: 'DuplicateChapters',
      passed: duplicates.length === 0,
      severity: duplicates.length > 0 ? 'medium' : 'low',
      details: duplicates.length > 0 ? `Duplicate chapter(s): ${duplicates.join(', ')}` : 'No duplicate chapters',
    };
  }

  private checkMetadataPresence(present: boolean): ValidationCheck {
    return {
      name: 'MetadataPresence',
      passed: present,
      severity: present ? 'low' : 'high',
      details: present ? 'Metadata present' : 'Metadata is missing',
    };
  }

  private checkTOCValidity(entries: number, chapterCount: number): ValidationCheck {
    return {
      name: 'TOCValidity',
      passed: entries === chapterCount,
      severity: entries !== chapterCount ? 'medium' : 'low',
      details: entries === chapterCount
        ? `TOC has ${entries} entries matching ${chapterCount} chapters`
        : `TOC has ${entries} entries but there are ${chapterCount} chapters`,
    };
  }

  private checkRenderedFormats(formats: string[]): ValidationCheck {
    return {
      name: 'RenderedFormats',
      passed: formats.length > 0,
      severity: formats.length === 0 ? 'high' : 'low',
      details: formats.length > 0 ? `Rendered ${formats.length} format(s): ${formats.join(', ')}` : 'No formats rendered',
    };
  }

  private checkExportedFormats(formats: string[]): ValidationCheck {
    return {
      name: 'ExportedFormats',
      passed: formats.length > 0,
      severity: formats.length === 0 ? 'medium' : 'low',
      details: formats.length > 0 ? `Exported ${formats.length} format(s): ${formats.join(', ')}` : 'No formats exported',
    };
  }
}
