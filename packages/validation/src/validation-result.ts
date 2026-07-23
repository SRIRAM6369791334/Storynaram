import type { ValidationSeverity } from './validation-severity.js';
import type { EntityId } from '@storynaram/core';

export interface ValidationIssue {
  path: string;
  message: string;
  severity: ValidationSeverity;
  code?: string;
}

export interface ValidationResult {
  resultId: string;
  entityId: EntityId;
  passed: boolean;
  score: number;
  issues: ValidationIssue[];
  timestamp: Date;
}
