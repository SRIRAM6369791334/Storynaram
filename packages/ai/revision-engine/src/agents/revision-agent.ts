import type { IssueReport } from '../types/revision-report.js';
import type { RevisionPassType } from '../types/revision-context.js';

export interface RevisionAgentResult {
  passType: RevisionPassType;
  passed: boolean;
  issuesFound: IssueReport[];
  issuesResolved: number;
  details: string[];
  revisedContent?: string;
}

export abstract class RevisionAgent {
  abstract readonly passType: RevisionPassType;
  abstract readonly name: string;

  abstract execute(
    content: string,
    chapterNumber: number,
    context: Record<string, unknown>,
  ): RevisionAgentResult | Promise<RevisionAgentResult>;
}
