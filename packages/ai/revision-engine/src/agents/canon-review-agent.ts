import { RevisionAgent, type RevisionAgentResult } from './revision-agent.js';
import type { RevisionPassType } from '../types/revision-context.js';
import type { IssueReport } from '../types/revision-report.js';

export class CanonReviewAgent extends RevisionAgent {
  readonly passType: RevisionPassType = 'canon';
  readonly name = 'Canon Validation';

  execute(content: string, chapterNumber: number, context: Record<string, unknown>): RevisionAgentResult {
    const issues: IssueReport[] = [];
    const canonFacts = context.canonFacts as string[] ?? [];
    const canonEvents = context.canonEvents as string[] ?? [];
    const canonHistory = context.canonHistory as string[] ?? [];
    const details: string[] = [];

    for (const fact of canonFacts) {
      if (fact.includes('should not')) {
        const parts = fact.split(/\bshould not\b/i);
        const forbiddenThing = parts[0]?.trim();
        if (forbiddenThing) {
          const escapedPattern = forbiddenThing.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escapedPattern, 'i');
          if (regex.test(content)) {
            issues.push({
              id: crypto.randomUUID(),
              type: 'canon-violation',
              severity: 'critical',
              chapterNumber,
              description: `Canon violation: "${forbiddenThing}" should not appear but was found.`,
              suggestion: `Remove or rewrite the reference to "${forbiddenThing}".`,
              resolved: false,
            });
          }
        }
      }
    }

    for (const event of canonEvents) {
      const escapedEvent = event.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const eventPattern = new RegExp(escapedEvent, 'i');
      if (eventPattern.test(content)) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'canon-event',
          severity: 'low',
          chapterNumber,
          description: `Canon event "${event}" verified present.`,
          suggestion: '',
          resolved: false,
        });
      }
    }

    for (const history of canonHistory) {
      const escapedHistory = history.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const historyPattern = new RegExp(escapedHistory, 'i');
      if (!historyPattern.test(content)) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'missing-history',
          severity: 'medium',
          chapterNumber,
          description: `Canon history "${history}" is not referenced.`,
          suggestion: `Add a reference to "${history}" if relevant to this chapter.`,
          resolved: false,
        });
      }
    }

    if (issues.length > 0) details.push(`Found ${issues.length} canon issue(s)`);
    else details.push('Canon validated');

    return {
      passType: this.passType,
      passed: issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
      issuesFound: issues,
      issuesResolved: 0,
      details,
    };
  }
}
