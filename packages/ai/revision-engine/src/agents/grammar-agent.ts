import { RevisionAgent, type RevisionAgentResult } from './revision-agent.js';
import type { RevisionPassType } from '../types/revision-context.js';
import { IssueDetector } from '../detection/issue-detector.js';
import { ImprovementApplier } from '../improvement/improvement-applier.js';

export class GrammarAgent extends RevisionAgent {
  readonly passType: RevisionPassType = 'grammar';
  readonly name = 'Grammar & Spelling Review';

  private issueDetector = new IssueDetector();
  private improvementApplier = new ImprovementApplier();

  execute(content: string, chapterNumber: number, context: Record<string, unknown>): RevisionAgentResult {
    const allIssues: import('../types/revision-report').IssueReport[] = [];

    const spellingIssues = this.issueDetector.detectSpelling(content, chapterNumber);
    allIssues.push(...spellingIssues);

    const grammarIssues = this.issueDetector.detectGrammar(content, chapterNumber);
    allIssues.push(...grammarIssues);

    const formattingIssues = this.detectFormatting(content, chapterNumber);
    allIssues.push(...formattingIssues);

    const autoFix = context.autoFix as boolean ?? false;
    let resolvedCount = 0;
    let revisedContent = content;

    if (autoFix && allIssues.length > 0) {
      const result = this.improvementApplier.applyAutoFixes(content, chapterNumber, allIssues);
      revisedContent = result.content;
      resolvedCount = result.changes;
    }

    const details: string[] = [];
    if (spellingIssues.length > 0) details.push(`Found ${spellingIssues.length} spelling issue(s)`);
    if (grammarIssues.length > 0) details.push(`Found ${grammarIssues.length} grammar issue(s)`);
    if (formattingIssues.length > 0) details.push(`Found ${formattingIssues.length} formatting issue(s)`);

    return {
      passType: this.passType,
      passed: allIssues.length === 0,
      issuesFound: allIssues,
      issuesResolved: resolvedCount,
      details: details.length > 0 ? details : ['No issues found'],
      revisedContent,
    };
  }

  private detectFormatting(content: string, chapterNumber: number): import('../types/revision-report').IssueReport[] {
    const issues: import('../types/revision-report').IssueReport[] = [];
    const lines = content.split('\n');

    let consecutiveBlankLines = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i]!.trim() === '') {
        consecutiveBlankLines++;
      } else {
        if (consecutiveBlankLines > 2) {
          issues.push({
            id: crypto.randomUUID(),
            type: 'formatting',
            severity: 'low',
            chapterNumber,
            description: `Found ${consecutiveBlankLines} consecutive blank lines at line ${i + 1}.`,
            suggestion: 'Reduce to at most 2 consecutive blank lines.',
            resolved: false,
          });
        }
        consecutiveBlankLines = 0;
      }
    }

    const singleQuoteCount = (content.match(/'/g) ?? []).length;
    const doubleQuoteCount = (content.match(/"/g) ?? []).length;
    if (singleQuoteCount % 2 !== 0) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'formatting',
        severity: 'medium',
        chapterNumber,
        description: 'Unmatched single quotes found.',
        suggestion: 'Ensure all single quotes are properly paired.',
        resolved: false,
      });
    }
    if (doubleQuoteCount % 2 !== 0) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'formatting',
        severity: 'medium',
        chapterNumber,
        description: 'Unmatched double quotes found.',
        suggestion: 'Ensure all double quotes are properly paired.',
        resolved: false,
      });
    }

    return issues;
  }
}
