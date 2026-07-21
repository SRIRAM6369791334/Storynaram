import { RevisionAgent, type RevisionAgentResult } from './revision-agent';
import type { RevisionPassType } from '../types/revision-context';
import type { IssueReport } from '../types/revision-report';

const WEAK_ADJECTIVES = /\b(good|bad|nice|great|big|small|pretty|ugly|old|new|happy|sad)\b/gi;
const OVERUSED_ADVERBS = /\b(very|really|quite|extremely|absolutely|totally|just|literally)\b/gi;
const CLICHES = [
  { pattern: /\bit was a dark and stormy night\b/i, suggestion: 'Avoid this classic cliché' },
  { pattern: /\ball along\b/i, suggestion: 'Use more specific phrasing' },
  { pattern: /\bin the nick of time\b/i, suggestion: 'Use more specific phrasing' },
  { pattern: /\bheart skipped a beat\b/i, suggestion: 'Use more specific phrasing' },
  { pattern: /\bbut little did they know\b/i, suggestion: 'Use more direct narration' },
  { pattern: /\bthe walls had ears\b/i, suggestion: 'Use more specific phrasing' },
];

export class StyleReviewAgent extends RevisionAgent {
  readonly passType: RevisionPassType = 'style';
  readonly name = 'Style Improvement';

  execute(content: string, chapterNumber: number, _context: Record<string, unknown>): RevisionAgentResult {
    const issues: IssueReport[] = [];
    const details: string[] = [];

    const weakAdj = content.match(WEAK_ADJECTIVES);
    if (weakAdj && weakAdj.length > 5) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'weak-vocabulary',
        severity: 'low',
        chapterNumber,
        description: `Found ${weakAdj.length} weak or generic adjectives.`,
        suggestion: 'Replace with more vivid, specific descriptors.',
        resolved: false,
      });
    }

    const overusedAdverbs = content.match(OVERUSED_ADVERBS);
    if (overusedAdverbs && overusedAdverbs.length > 3) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'overused-adverbs',
        severity: 'low',
        chapterNumber,
        description: `Found ${overusedAdverbs.length} overused adverbs.`,
        suggestion: 'Replace with stronger verbs or more specific modifiers.',
        resolved: false,
      });
    }

    for (const cliche of CLICHES) {
      const matches = content.match(cliche.pattern);
      if (matches) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'cliche',
          severity: 'medium',
          chapterNumber,
          description: `Found cliché: "${matches[0]!.trim().slice(0, 60)}"`,
          suggestion: cliche.suggestion + ' or rewrite for originality.',
          resolved: false,
        });
      }
    }

    const exclamationCount = (content.match(/!/g) ?? []).length;
    if (exclamationCount > 10) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'overused-punctuation',
        severity: 'low',
        chapterNumber,
        description: `Found ${exclamationCount} exclamation marks.`,
        suggestion: 'Use exclamation marks sparingly for maximum impact.',
        resolved: false,
      });
    }

    const emotionWords = /\b(love|hate|fear|joy|anger|sorrow|hope|despair|courage|grief|passion|wonder|awe|dread|longing)\b/gi;
    const emotionMatches = content.match(emotionWords);
    if (!emotionMatches || emotionMatches.length < 3) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'low-emotion',
        severity: 'low',
        chapterNumber,
        description: 'Low emotional vocabulary in this chapter.',
        suggestion: 'Add more emotionally resonant language to engage readers.',
        resolved: false,
      });
    }

    const longParagraphs = content.split('\n\n').filter(p => p.split(/\s+/).length > 150);
    if (longParagraphs.length > 0) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'readability',
        severity: 'low',
        chapterNumber,
        description: `Found ${longParagraphs.length} very long paragraph(s).`,
        suggestion: 'Break long paragraphs into smaller chunks for readability.',
        resolved: false,
      });
    }

    if (issues.length > 0) details.push(`Found ${issues.length} style issue(s)`);
    else details.push('Style verified');

    return {
      passType: this.passType,
      passed: issues.length === 0,
      issuesFound: issues,
      issuesResolved: 0,
      details,
    };
  }
}
