import { Injectable } from '@nestjs/common';
import type { ValidationMetrics } from './types.js';

@Injectable()
export class ValidationStatisticsService {
  private totalValidations = 0;
  private successfulValidations = 0;
  private failedValidations = 0;
  private totalExecutionTimeMs = 0;
  private lastValidationTimestamp = new Date();
  private readonly byMode = new Map<string, number>();
  private readonly bySchema = new Map<string, number>();

  record(schemaId: string, mode: string, passed: boolean, durationMs: number): void {
    this.totalValidations++;
    this.totalExecutionTimeMs += durationMs;
    this.lastValidationTimestamp = new Date();

    if (passed) {
      this.successfulValidations++;
    } else {
      this.failedValidations++;
    }

    this.byMode.set(mode, (this.byMode.get(mode) ?? 0) + 1);
    this.bySchema.set(schemaId, (this.bySchema.get(schemaId) ?? 0) + 1);
  }

  getMetrics(): ValidationMetrics {
    const averagesPerSec =
      this.totalExecutionTimeMs > 0
        ? (this.totalValidations / this.totalExecutionTimeMs) * 1000
        : 0;

    return {
      totalValidations: this.totalValidations,
      successfulValidations: this.successfulValidations,
      failedValidations: this.failedValidations,
      totalExecutionTimeMs: this.totalExecutionTimeMs,
      averageExecutionTimeMs:
        this.totalValidations > 0
          ? this.totalExecutionTimeMs / this.totalValidations
          : 0,
      validationsByMode: Object.fromEntries(this.byMode),
      validationsBySchema: Object.fromEntries(this.bySchema),
      throughputPerSecond: averagesPerSec,
      lastValidationTimestamp: this.lastValidationTimestamp,
    };
  }

  reset(): void {
    this.totalValidations = 0;
    this.successfulValidations = 0;
    this.failedValidations = 0;
    this.totalExecutionTimeMs = 0;
    this.lastValidationTimestamp = new Date();
    this.byMode.clear();
    this.bySchema.clear();
  }
}
