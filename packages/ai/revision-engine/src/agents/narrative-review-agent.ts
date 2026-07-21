import { RevisionAgent, type RevisionAgentResult } from './revision-agent';
import type { RevisionPassType } from '../types/revision-context';
import type { IssueReport } from '../types/revision-report';

export class NarrativeReviewAgent extends RevisionAgent {
  readonly passType: RevisionPassType = 'narrative';
  readonly name = 'Narrative Quality Review';

  execute(content: string, chapterNumber: number, _context: Record<string, unknown>): RevisionAgentResult {
    const issues: IssueReport[] = [];
    const details: string[] = [];

    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);

    if (paragraphs.length === 0) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'empty-content',
        severity: 'critical',
        chapterNumber,
        description: 'Chapter has no content.',
        suggestion: 'Generate or provide content for this chapter.',
        resolved: false,
      });
      return {
        passType: this.passType,
        passed: false,
        issuesFound: issues,
        issuesResolved: 0,
        details: ['Chapter is empty'],
      };
    }

    for (let i = 1; i < paragraphs.length; i++) {
      const prevEnd = paragraphs[i - 1]!.trim().slice(-1);
      const currStart = paragraphs[i]!.trim().slice(0, 3);

      if (!prevEnd.match(/[.!?"']/) && currStart.match(/^[A-Z"']/)) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'weak-transition',
          severity: 'low',
          chapterNumber,
          description: `Weak transition between paragraphs ${i} and ${i + 1}.`,
          suggestion: 'Add a transitional phrase or scene break.',
          resolved: false,
        });
      }
    }

    const sentences = content.match(/[^.!?\n]+[.!?](\s|$)/g) ?? [];
    let longSentenceCount = 0;
    for (const sentence of sentences) {
      const words = sentence.split(/\s+/).length;
      if (words > 40) longSentenceCount++;
    }
    if (longSentenceCount > sentences.length * 0.2) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'pacing',
        severity: 'low',
        chapterNumber,
        description: `${longSentenceCount} of ${sentences.length} sentences are very long (>40 words).`,
        suggestion: 'Break up long sentences to improve pacing.',
        resolved: false,
      });
    }

    if (issues.length > 0) details.push(`Found ${issues.length} narrative issue(s)`);
    else details.push('Narrative quality verified');

    return {
      passType: this.passType,
      passed: issues.length === 0,
      issuesFound: issues,
      issuesResolved: 0,
      details,
    };
  }
}
