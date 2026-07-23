import { RevisionAgent, type RevisionAgentResult } from './revision-agent.js';
import type { RevisionPassType } from '../types/revision-context.js';
import type { IssueReport } from '../types/revision-report.js';
import { StoryQualityScore, type StoryQualityScoreParams } from '../quality/story-quality-score.js';

export class QualityReviewAgent extends RevisionAgent {
  readonly passType: RevisionPassType = 'quality';
  readonly name = 'Quality Review & Scoring';

  private qualityScorer = new StoryQualityScore();

  execute(content: string, chapterNumber: number, context: Record<string, unknown>): RevisionAgentResult {
    const issues: IssueReport[] = [];
    const details: string[] = [];

    const inputParams = context.qualityParams as StoryQualityScoreParams | undefined;
    if (inputParams) {
      const scores = this.qualityScorer.calculate(inputParams);

      if (scores.overall < 50) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'low-quality',
          severity: 'high',
          chapterNumber,
          description: `Overall quality score is ${scores.overall}/100.`,
          suggestion: 'Major revisions needed across multiple dimensions.',
          resolved: false,
        });
      }

      const lowestScore = Math.min(scores.character, scores.world, scores.timeline, scores.canon, scores.narrative, scores.dialogue, scores.readability, scores.emotion, scores.consistency);
      const lowestCategory = Object.entries(scores).find(([, v]) => v === lowestScore)?.[0];

      if (lowestScore < 40 && lowestCategory) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'weak-category',
          severity: 'medium',
          chapterNumber,
          description: `"${lowestCategory}" score is only ${lowestScore}/100.`,
          suggestion: `Focus revision efforts on improving "${lowestCategory}".`,
          resolved: false,
        });
      }

      details.push(`Quality score: ${scores.overall}/100`);
      details.push(`Character: ${scores.character}, World: ${scores.world}, Timeline: ${scores.timeline}, Canon: ${scores.canon}`);
      details.push(`Narrative: ${scores.narrative}, Dialogue: ${scores.dialogue}, Readability: ${scores.readability}, Emotion: ${scores.emotion}, Consistency: ${scores.consistency}`);
    } else {
      details.push('Quality scoring skipped (no parameters provided)');
    }

    return {
      passType: this.passType,
      passed: issues.length === 0,
      issuesFound: issues,
      issuesResolved: 0,
      details,
    };
  }
}
