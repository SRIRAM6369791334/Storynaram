import { ValidationSeverity } from './validation-severity';
import { EntityId } from '@storynaram/core';

export type ValidationIssue = {
  path: string;
  message: string;
  severity: ValidationSeverity;
  code?: string;
};

export type ValidationResult = {
  resultId: string;
  entityId: EntityId;
  passed: boolean;
  score: number;
  issues: ValidationIssue[];
  timestamp: Date;
};
