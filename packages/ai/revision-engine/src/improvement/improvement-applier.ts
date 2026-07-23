import type { IssueReport, ImprovementReport } from '../types/revision-report.js';

const COMMON_FIXES: Array<{ pattern: RegExp; replacement: string; description: string }> = [
  { pattern: /\bi\b/g, replacement: 'I', description: 'Capitalize pronoun "I"' },
  { pattern: /\bteh\b/gi, replacement: 'the', description: 'Fix "teh" to "the"' },
  { pattern: /\brecieve\b/gi, replacement: 'receive', description: 'Fix "recieve" to "receive"' },
  { pattern: /\brecieved\b/gi, replacement: 'received', description: 'Fix "recieved" to "received"' },
  { pattern: /\bdefinately\b/gi, replacement: 'definitely', description: 'Fix "definately" to "definitely"' },
  { pattern: /\bseperate\b/gi, replacement: 'separate', description: 'Fix "seperate" to "separate"' },
  { pattern: /\baccomodate\b/gi, replacement: 'accommodate', description: 'Fix "accomodate" to "accommodate"' },
  { pattern: /\boccured\b/gi, replacement: 'occurred', description: 'Fix "occured" to "occurred"' },
  { pattern: /\bbeleive\b/gi, replacement: 'believe', description: 'Fix "beleive" to "believe"' },
  { pattern: /\bwierd\b/gi, replacement: 'weird', description: 'Fix "wierd" to "weird"' },
  { pattern: /\buint\b/gi, replacement: 'unit', description: 'Fix "uint" to "unit"' },
  { pattern: /\bthier\b/gi, replacement: 'their', description: 'Fix "thier" to "their"' },
];

export interface ApplyFixResult {
  content: string;
  changes: number;
  improvements: ImprovementReport[];
}

export class ImprovementApplier {
  applyAutoFixes(
    content: string,
    chapterNumber: number,
    issues: IssueReport[],
  ): ApplyFixResult {
    let revised = content;
    const improvements: ImprovementReport[] = [];
    let changes = 0;

    for (const issue of issues) {
      if (issue.type === 'spelling') {
        for (const fix of COMMON_FIXES) {
          if (fix.pattern.test(revised)) {
            const before = revised;
            revised = revised.replace(fix.pattern, fix.replacement);
            if (before !== revised) {
              changes++;
              improvements.push({
                passType: 'grammar',
                chapterNumber,
                originalText: before,
                revisedText: revised,
                reason: fix.description,
              });
            }
          }
        }
      }
    }

    return { content: revised, changes, improvements };
  }

  applyAutoFixAll(content: string): { content: string; changes: number } {
    let revised = content;
    let changes = 0;

    for (const fix of COMMON_FIXES) {
      const before = revised;
      revised = revised.replace(fix.pattern, fix.replacement);
      if (before !== revised) {
        changes += this.countMatches(before, fix.pattern);
      }
    }

    return { content: revised, changes };
  }

  generateDiff(original: string, revised: string): { additions: number; deletions: number; modifications: number } {
    const origLines = original.split('\n');
    const revLines = revised.split('\n');
    let additions = 0;
    let deletions = 0;
    let modifications = 0;

    const maxLen = Math.max(origLines.length, revLines.length);
    for (let i = 0; i < maxLen; i++) {
      if (i >= origLines.length) {
        additions++;
      } else if (i >= revLines.length) {
        deletions++;
      } else if (origLines[i] !== revLines[i]) {
        modifications++;
      }
    }

    return { additions, deletions, modifications };
  }

  private countMatches(text: string, pattern: RegExp): number {
    const matches = text.match(pattern);
    return matches ? matches.length : 0;
  }
}
