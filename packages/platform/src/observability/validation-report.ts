import { ValidationIssue } from '../cross-domain/cross-domain-validator.js';
import { ConsistencyCheck } from '../cross-domain/consistency-validator.js';

export interface ValidationReportEntry {
  domain: string;
  totalIssues: number;
  errors: number;
  warnings: number;
  infos: number;
  issues: ValidationIssue[];
}

export interface ValidationReport {
  entries: ValidationReportEntry[];
  consistencyChecks: ConsistencyCheck[];
  totalIssues: number;
  totalErrors: number;
  totalWarnings: number;
  totalInfos: number;
  isConsistent: boolean;
  generatedAt: Date;
}

export class ValidationReportBuilder {
  build(
    issues: ValidationIssue[],
    consistencyChecks: ConsistencyCheck[],
  ): ValidationReport {
    const domainMap = new Map<string, ValidationIssue[]>();
    for (const issue of issues) {
      const list = domainMap.get(issue.domain) ?? [];
      list.push(issue);
      domainMap.set(issue.domain, list);
    }

    const entries: ValidationReportEntry[] = [];
    let totalErrors = 0;
    let totalWarnings = 0;
    let totalInfos = 0;

    for (const [domain, domainIssues] of domainMap) {
      const errors = domainIssues.filter(i => i.severity === 'error').length;
      const warnings = domainIssues.filter(i => i.severity === 'warning').length;
      const infos = domainIssues.filter(i => i.severity === 'info').length;
      totalErrors += errors;
      totalWarnings += warnings;
      totalInfos += infos;
      entries.push({
        domain,
        totalIssues: domainIssues.length,
        errors, warnings, infos,
        issues: domainIssues,
      });
    }

    return {
      entries,
      consistencyChecks,
      totalIssues: issues.length,
      totalErrors,
      totalWarnings,
      totalInfos,
      isConsistent: consistencyChecks.every(c => c.passed),
      generatedAt: new Date(),
    };
  }
}
