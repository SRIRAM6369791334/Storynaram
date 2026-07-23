import { RevisionAgent, type RevisionAgentResult } from './revision-agent.js';
import type { RevisionPassType } from '../types/revision-context.js';
import { IssueDetector } from '../detection/issue-detector.js';
import type { IssueReport } from '../types/revision-report.js';

export class TimelineReviewAgent extends RevisionAgent {
  readonly passType: RevisionPassType = 'timeline';
  readonly name = 'Timeline Validation';

  private issueDetector = new IssueDetector();

  execute(content: string, chapterNumber: number, context: Record<string, unknown>): RevisionAgentResult {
    const issues: IssueReport[] = [];
    const timeline = context.timeline as string | undefined;
    const storyTimeline = context.storyTimeline as string ?? '';

    const timeConflicts = this.issueDetector.detectTimelineConflicts(content, chapterNumber, timeline);
    issues.push(...timeConflicts);

    const timePattern = /\b(\d{1,2})\s*(years?|months?|weeks?|days?|hours?)\s*(later|earlier|before|after)\b/gi;
    const timeMatches = content.match(timePattern) ?? [];

    if (timeMatches.length > 3) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'timeline-complexity',
        severity: 'low',
        chapterNumber,
        description: `Found ${timeMatches.length} time references which may be confusing.`,
        suggestion: 'Consider simplifying the timeline or adding clearer transitions.',
        resolved: false,
      });
    }

    if (storyTimeline) {
      const escapedTimeline = storyTimeline.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const timelinePattern = new RegExp(escapedTimeline, 'i');
      if (!timelinePattern.test(content)) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'timeline-reference',
          severity: 'low',
          chapterNumber,
          description: `Story timeline "${storyTimeline}" is not referenced.`,
          suggestion: `Add reference to "${storyTimeline}" for temporal context.`,
          resolved: false,
        });
      }
    }

    const details: string[] = [];
    if (issues.length > 0) details.push(`Found ${issues.length} timeline issue(s)`);
    else details.push('Timeline validated');

    return {
      passType: this.passType,
      passed: issues.length === 0,
      issuesFound: issues,
      issuesResolved: 0,
      details,
    };
  }
}
