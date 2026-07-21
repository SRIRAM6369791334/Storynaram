import { RevisionAgent, type RevisionAgentResult } from './revision-agent';
import type { RevisionPassType } from '../types/revision-context';
import type { IssueReport } from '../types/revision-report';

export class PlotReviewAgent extends RevisionAgent {
  readonly passType: RevisionPassType = 'plot';
  readonly name = 'Plot Validation';

  execute(content: string, chapterNumber: number, context: Record<string, unknown>): RevisionAgentResult {
    const issues: IssueReport[] = [];
    const details: string[] = [];
    const foreshadowElements = context.foreshadowElements as string[] ?? [];
    const conflictElements = context.conflictElements as string[] ?? [];
    const arcElements = context.arcElements as string[] ?? [];

    for (const foreshadow of foreshadowElements) {
      const escapedForeshadow = foreshadow.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(escapedForeshadow, 'i');
      if (!pattern.test(content)) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'missing-foreshadow',
          severity: 'medium',
          chapterNumber,
          description: `Foreshadow element "${foreshadow}" is missing.`,
          suggestion: `Add setup for "${foreshadow}" earlier in the story.`,
          resolved: false,
        });
      }
    }

    for (const conflict of conflictElements) {
      const escapedConflict = conflict.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(escapedConflict, 'i');
      if (!pattern.test(content)) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'unresolved-conflict',
          severity: 'high',
          chapterNumber,
          description: `Conflict element "${conflict}" is not resolved.`,
          suggestion: `Address or resolve "${conflict}" in this chapter.`,
          resolved: false,
        });
      }
    }

    for (const arc of arcElements) {
      const escapedArc = arc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(escapedArc, 'i');
      if (!pattern.test(content)) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'broken-arc',
          severity: 'high',
          chapterNumber,
          description: `Story arc element "${arc}" is not addressed.`,
          suggestion: `Connect this chapter to the "${arc}" storyline.`,
          resolved: false,
        });
      }
    }

    const plotHolePattern = /\b(suddenly|out of nowhere|inexplicably|conveniently|deus ex machina)\b/gi;
    const plotHoles = content.match(plotHolePattern);
    if (plotHoles && plotHoles.length > 2) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'plot-hole',
        severity: 'high',
        chapterNumber,
        description: `Found ${plotHoles.length} potentially unearned plot devices.`,
        suggestion: 'Ensure major story developments are properly set up.',
        resolved: false,
      });
    }

    if (issues.length > 0) details.push(`Found ${issues.length} plot issue(s)`);
    else details.push('Plot validated');

    return {
      passType: this.passType,
      passed: issues.length === 0,
      issuesFound: issues,
      issuesResolved: 0,
      details,
    };
  }
}
