import type { RevisionPassType } from './revision-context';

export interface RevisionReport {
  summary: string;
  passed: boolean;
  passes: PassReport[];
  qualityScores: QualityScoreReport;
  issues: IssueReport[];
  improvements: ImprovementReport[];
}

export interface PassReport {
  passType: RevisionPassType;
  name: string;
  passed: boolean;
  issuesFound: number;
  issuesResolved: number;
  durationMs: number;
  details: string[];
}

export interface QualityScoreReport {
  overall: number;
  character: number;
  timeline: number;
  canon: number;
  narrative: number;
  dialogue: number;
  grammar: number;
  style: number;
}

export interface IssueReport {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  chapterNumber: number;
  description: string;
  suggestion: string;
  resolved: boolean;
}

export interface ImprovementReport {
  passType: string;
  chapterNumber: number;
  originalText: string;
  revisedText: string;
  reason: string;
}

export type DiffType = 'addition' | 'deletion' | 'modification';

export interface DiffEntry {
  type: DiffType;
  chapterNumber: number;
  originalLine: string;
  revisedLine: string;
  lineNumber: number;
}

export interface DiffReport {
  entries: DiffEntry[];
  totalAdditions: number;
  totalDeletions: number;
  totalModifications: number;
}
