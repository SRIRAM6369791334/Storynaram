import type { SchemaId } from '@storynaram/schemas';
import type { EntityId } from '@storynaram/core';
import type { ValidationIssue } from './validation-result';

export type ValidationMode = 'strict' | 'relaxed' | 'development' | 'production' | 'fast' | 'deep';

export interface ValidationProfileConfig {
  mode: ValidationMode;
  stopOnFirstError: boolean;
  includeWarnings: boolean;
  includeInfo: boolean;
  verbose: boolean;
  maxErrors?: number;
  timeoutMs?: number;
}

export interface ValidationContextData {
  schemaId: SchemaId;
  data: unknown;
  profileName: string;
  profile: ValidationProfileConfig;
  metadata?: Record<string, unknown>;
  entityId?: EntityId;
}

export interface ValidationEngineResult {
  resultId: string;
  schemaId: SchemaId;
  schemaTitle?: string;
  schemaVersion?: string;
  entityId?: EntityId;
  passed: boolean;
  score: number;
  issues: ValidationIssue[];
  executionTimeMs: number;
  mode: ValidationMode;
  profileName: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ValidationBatchResult {
  results: ValidationEngineResult[];
  totalCount: number;
  passedCount: number;
  failedCount: number;
  averageScore: number;
  totalExecutionTimeMs: number;
}

export interface ValidationMetrics {
  totalValidations: number;
  successfulValidations: number;
  failedValidations: number;
  totalExecutionTimeMs: number;
  averageExecutionTimeMs: number;
  validationsByMode: Record<string, number>;
  validationsBySchema: Record<string, number>;
  throughputPerSecond: number;
  lastValidationTimestamp: Date;
}

export interface ValidationEngineOptions {
  defaultProfile?: string;
  cacheResults?: boolean;
  cacheMaxSize?: number;
  collectMetrics?: boolean;
}
