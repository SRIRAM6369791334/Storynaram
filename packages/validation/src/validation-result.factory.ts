import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ValidationIssue } from './validation-result';
import { ValidationSeverity } from './validation-severity';
import type { ValidationEngineResult, ValidationContextData, ValidationProfileConfig } from './types';
import type { SchemaMeta } from '@storynaram/schemas';

@Injectable()
export class ValidationResultFactory {
  createSuccess(
    context: ValidationContextData,
    meta?: SchemaMeta,
    executionTimeMs?: number,
    metadata?: Record<string, unknown>,
  ): ValidationEngineResult {
    return {
      resultId: randomUUID(),
      schemaId: context.schemaId,
      schemaTitle: meta?.title,
      schemaVersion: meta?.version,
      entityId: context.entityId,
      passed: true,
      score: 1,
      issues: [],
      executionTimeMs: executionTimeMs ?? 0,
      mode: context.profile.mode,
      profileName: context.profileName,
      timestamp: new Date(),
      metadata,
    };
  }

  createFailure(
    context: ValidationContextData,
    ajvErrors: { instancePath: string; message?: string; keyword?: string }[],
    meta?: SchemaMeta,
    executionTimeMs?: number,
    metadata?: Record<string, unknown>,
  ): ValidationEngineResult {
    const issues = this.transformAjvErrors(ajvErrors, context.profile);
    const score = this.calculateScore(issues);

    return {
      resultId: randomUUID(),
      schemaId: context.schemaId,
      schemaTitle: meta?.title,
      schemaVersion: meta?.version,
      entityId: context.entityId,
      passed: false,
      score,
      issues,
      executionTimeMs: executionTimeMs ?? 0,
      mode: context.profile.mode,
      profileName: context.profileName,
      timestamp: new Date(),
      metadata,
    };
  }

  private transformAjvErrors(
    ajvErrors: { instancePath: string; message?: string; keyword?: string }[],
    profile: ValidationProfileConfig,
  ): ValidationIssue[] {
    return ajvErrors
      .map(err => {
        const severity =
          err.keyword === 'error' || err.keyword === 'required'
            ? ValidationSeverity.ERROR
            : err.keyword === 'warning'
            ? ValidationSeverity.WARNING
            : ValidationSeverity.ERROR;

        return {
          path: err.instancePath,
          message: err.message ?? 'Validation error',
          severity,
          code: err.keyword,
        };
      })
      .filter(issue => {
        if (issue.severity === ValidationSeverity.WARNING && !profile.includeWarnings) return false;
        if (issue.severity === ValidationSeverity.INFO && !profile.includeInfo) return false;
        return true;
      })
      .slice(0, profile.maxErrors);
  }

  private calculateScore(issues: ValidationIssue[]): number {
    if (issues.length === 0) return 1;
    let score = 1;
    for (const issue of issues) {
      if (issue.severity === ValidationSeverity.ERROR) score -= 0.2;
      if (issue.severity === ValidationSeverity.WARNING) score -= 0.05;
    }
    return Math.max(0, score);
  }
}
