import type { IssueReport } from '../types/revision-report';

export interface DetectIssueParams {
  chapterNumber: number;
  content: string;
  expectedCharacters?: string[];
  worldNames?: string[];
  timeline?: string;
}

const WEAK_DIALOGUE_TAGS = ['said', 'asked', 'replied', 'answered', 'responded'];
const STRONG_DIALOGUE_TAGS = ['whispered', 'shouted', 'murmured', 'exclaimed', 'demanded', 'pleaded', 'insisted', 'whined', 'bellowed', 'growled'];

const COMMON_MISTAKES = [
  { pattern: /\bi\b/g, suggestion: 'Capitalize "I"' },
  { pattern: /\bteh\b/gi, suggestion: '"teh" should be "the"' },
  { pattern: /\brecieve\b/gi, suggestion: '"recieve" should be "receive"' },
  { pattern: /\brecieved\b/gi, suggestion: '"recieved" should be "received"' },
  { pattern: /\bthier\b/gi, suggestion: '"thier" should be "their"' },
  { pattern: /\bdefinately\b/gi, suggestion: '"definately" should be "definitely"' },
  { pattern: /\bseperate\b/gi, suggestion: '"seperate" should be "separate"' },
  { pattern: /\baccomodate\b/gi, suggestion: '"accomodate" should be "accommodate"' },
  { pattern: /\boccured\b/gi, suggestion: '"occured" should be "occurred"' },
  { pattern: /\bbeleive\b/gi, suggestion: '"beleive" should be "believe"' },
  { pattern: /\bwierd\b/gi, suggestion: '"wierd" should be "weird"' },
  { pattern: /\buint\b/gi, suggestion: '"uint" should be "unit"' },
  { pattern: /\bthier\b/gi, suggestion: '"thier" should be "their"' },
];

export class IssueDetector {
  detectSpelling(content: string, chapterNumber: number): IssueReport[] {
    const issues: IssueReport[] = [];
    for (const mistake of COMMON_MISTAKES) {
      const matches = content.match(mistake.pattern);
      if (matches) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'spelling',
          severity: 'medium',
          chapterNumber,
          description: `Found ${matches.length} instance(s) of spelling issue: ${mistake.suggestion}`,
          suggestion: mistake.suggestion,
          resolved: false,
        });
      }
    }
    return issues;
  }

  detectGrammar(content: string, chapterNumber: number): IssueReport[] {
    const issues: IssueReport[] = [];
    const sentences = content.match(/[^.!?\n]+[.!?](\s|$)/g) ?? [];

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length === 0) continue;

      if (trimmed[0] && trimmed[0] !== trimmed[0].toUpperCase() && trimmed[0] !== '"' && trimmed[0] !== "'") {
        issues.push({
          id: crypto.randomUUID(),
          type: 'grammar',
          severity: 'medium',
          chapterNumber,
          description: `Sentence does not start with capital letter: "${trimmed.slice(0, 50)}..."`,
          suggestion: 'Capitalize the first letter of the sentence.',
          resolved: false,
        });
      }
    }

    const runOnPattern = /[,;][\s]*[a-z]+[,;][\s]*[a-z]+[,;]/g;
    const runOns = content.match(runOnPattern);
    if (runOns) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'grammar',
        severity: 'low',
        chapterNumber,
        description: `Found ${runOns.length} potential run-on sentence(s).`,
        suggestion: 'Consider splitting long sentences for clarity.',
        resolved: false,
      });
    }

    return issues;
  }

  detectTimelineConflicts(content: string, chapterNumber: number, timeline?: string): IssueReport[] {
    const issues: IssueReport[] = [];
    const datePattern = /\b(\d{4})\b/g;
    const dates: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = datePattern.exec(content)) !== null) {
      if (match[1]) dates.push(match[1]);
    }

    for (let i = 1; i < dates.length; i++) {
      if (Number(dates[i]) < Number(dates[i - 1]) && Math.abs(Number(dates[i]) - Number(dates[i - 1])) > 1) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'timeline',
          severity: 'high',
          chapterNumber,
          description: `Possible timeline conflict: date ${dates[i]} appears after ${dates[i - 1]} but is earlier.`,
          suggestion: 'Verify chronological order of events.',
          resolved: false,
        });
      }
    }

    return issues;
  }

  detectMissingCharacters(content: string, chapterNumber: number, expectedCharacters: string[]): IssueReport[] {
    const issues: IssueReport[] = [];
    for (const character of expectedCharacters) {
      const escapedName = character.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(escapedName, 'i');
      if (!pattern.test(content)) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'missing-character',
          severity: 'high',
          chapterNumber,
          description: `Expected character "${character}" is not mentioned in this chapter.`,
          suggestion: `Add a scene or mention for "${character}".`,
          resolved: false,
        });
      }
    }
    return issues;
  }

  detectDuplicateContent(content: string, chapterNumber: number): IssueReport[] {
    const issues: IssueReport[] = [];
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    const seen = new Set<string>();

    for (const paragraph of paragraphs) {
      const normalized = paragraph.trim().toLowerCase();
      if (seen.has(normalized)) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'duplicate',
          severity: 'medium',
          chapterNumber,
          description: 'Duplicate paragraph found.',
          suggestion: 'Remove or rewrite the repeated paragraph.',
          resolved: false,
        });
      }
      seen.add(normalized);
    }

    return issues;
  }

  detectWeakDialogue(content: string, chapterNumber: number): IssueReport[] {
    const issues: IssueReport[] = [];
    const tagPattern = new RegExp(`"([^"]+)"\\s+(${WEAK_DIALOGUE_TAGS.join('|')})\\b`, 'gi');
    let match: RegExpExecArray | null;
    const weakCounts = new Map<string, number>();

    while ((match = tagPattern.exec(content)) !== null) {
      const tag = match[2]!.toLowerCase();
      weakCounts.set(tag, (weakCounts.get(tag) ?? 0) + 1);
    }

    for (const [tag, count] of weakCounts) {
      if (count > 3) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'weak-dialogue',
          severity: 'low',
          chapterNumber,
          description: `Dialogue tag "${tag}" used ${count} times. Consider varying with stronger tags.`,
          suggestion: `Replace some "${tag}" with stronger tags like: ${STRONG_DIALOGUE_TAGS.slice(0, 4).join(', ')}.`,
          resolved: false,
        });
      }
    }

    return issues;
  }

  detectAll(params: DetectIssueParams): IssueReport[] {
    const issues: IssueReport[] = [];

    issues.push(...this.detectSpelling(params.content, params.chapterNumber));
    issues.push(...this.detectGrammar(params.content, params.chapterNumber));
    issues.push(...this.detectTimelineConflicts(params.content, params.chapterNumber, params.timeline));
    issues.push(...this.detectDuplicateContent(params.content, params.chapterNumber));
    issues.push(...this.detectWeakDialogue(params.content, params.chapterNumber));

    if (params.expectedCharacters && params.expectedCharacters.length > 0) {
      issues.push(...this.detectMissingCharacters(params.content, params.chapterNumber, params.expectedCharacters));
    }

    return issues;
  }
}
