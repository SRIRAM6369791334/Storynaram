import { describe, it, expect } from 'vitest';
import { ValidationReportBuilder } from '../src/observability/validation-report';
import type { ValidationIssue } from '../src/cross-domain/cross-domain-validator';

describe('ValidationReportBuilder', () => {
  it('builds empty report', () => {
    const builder = new ValidationReportBuilder();
    const report = builder.build([], []);
    expect(report.totalIssues).toBe(0);
    expect(report.isConsistent).toBe(true);
    expect(report.entries).toHaveLength(0);
  });

  it('builds report with issues', () => {
    const builder = new ValidationReportBuilder();
    const issues: ValidationIssue[] = [
      { domain: 'character', entityId: '1', entityType: 'hero', issue: 'Missing name', severity: 'error' },
      { domain: 'world', entityId: '2', entityType: 'location', issue: 'No description', severity: 'warning' },
    ];
    const report = builder.build(issues, []);
    expect(report.totalIssues).toBe(2);
    expect(report.totalErrors).toBe(1);
    expect(report.totalWarnings).toBe(1);
    expect(report.entries).toHaveLength(2);
  });

  it('groups issues by domain', () => {
    const builder = new ValidationReportBuilder();
    const issues: ValidationIssue[] = [
      { domain: 'character', entityId: '1', entityType: 'h', issue: 'e1', severity: 'error' },
      { domain: 'character', entityId: '2', entityType: 'h', issue: 'e2', severity: 'warning' },
      { domain: 'world', entityId: '3', entityType: 'w', issue: 'e3', severity: 'info' },
    ];
    const report = builder.build(issues, []);
    expect(report.entries).toHaveLength(2);
    const charEntry = report.entries.find(e => e.domain === 'character');
    expect(charEntry).toBeDefined();
    expect(charEntry!.totalIssues).toBe(2);
    expect(charEntry!.errors).toBe(1);
    expect(charEntry!.warnings).toBe(1);
    expect(charEntry!.infos).toBe(0);
  });

  it('checks consistency from checks', () => {
    const builder = new ValidationReportBuilder();
    const report = builder.build([], [
      { checkName: 'c1', description: '', domains: ['character'], passed: true, details: [] },
      { checkName: 'c2', description: '', domains: ['world'], passed: false, details: ['Failed'] },
    ]);
    expect(report.isConsistent).toBe(false);
    expect(report.consistencyChecks).toHaveLength(2);
  });
});
