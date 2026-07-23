import { Injectable, Logger } from '@nestjs/common';
import {
  SchemaRegistryService,
  type SchemaId,
  SchemaNotFoundError,
} from '@storynaram/schemas';
import type { EntityId } from '@storynaram/core';
import { ValidationPort } from './validation-port.js';
import type { ValidationResult } from './validation-result.js';
import { ValidationPipeline } from './validation-pipeline.js';
import { ValidationProfileService } from './validation-profile.service.js';
import { ValidationStatisticsService } from './validation-statistics.service.js';
import { ValidationCache } from './validation-cache.js';
import type {
  ValidationEngineResult,
  ValidationBatchResult,
  ValidationMetrics,
} from './types.js';
import { ValidationExecutionError } from './errors.js';

@Injectable()
export class ValidationEngineService extends ValidationPort {
  private readonly logger = new Logger(ValidationEngineService.name);

  constructor(
    private readonly registry: SchemaRegistryService,
    private readonly pipeline: ValidationPipeline,
    private readonly profileService: ValidationProfileService,
    private readonly statistics: ValidationStatisticsService,
    private readonly cacheService: ValidationCache,
  ) {
    super();
  }

  async validate(data: unknown, schemaRef: string): Promise<ValidationResult> {
    const result = await this.validateById(schemaRef as SchemaId, data);
    return this.toLegacyResult(result);
  }

  async validateMany(
    data: unknown[],
    schemaRef: string,
  ): Promise<ValidationResult[]> {
    return Promise.all(data.map(d => this.validate(d, schemaRef)));
  }

  async validateById(
    schemaId: SchemaId,
    data: unknown,
    options?: {
      profile?: string;
      metadata?: Record<string, unknown>;
      entityId?: EntityId;
    },
  ): Promise<ValidationEngineResult> {
    if (!this.registry.has(schemaId)) {
      throw new SchemaNotFoundError(schemaId);
    }

    const cacheKey = `${schemaId}:${JSON.stringify(data)}:${options?.profile ?? 'default'}`;
    const cached = this.cacheService.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return cached;
    }

    const result = await this.pipeline.execute(
      schemaId,
      data,
      options?.profile,
      options?.metadata,
    );

    this.statistics.record(schemaId, result.mode, result.passed, result.executionTimeMs);

    if (result.passed) {
      this.logger.debug(`Validation PASS for ${schemaId} (${String(result.executionTimeMs)}ms)`);
    } else {
      const issueCount = result.issues.length;
      this.logger.debug(
        `Validation FAIL for ${schemaId} (${String(result.executionTimeMs)}ms): ${String(issueCount)} issues`,
      );
    }

    this.cacheService.set(cacheKey, result);
    return result;
  }

  async validateManyItems(
    items: {
      schemaId: SchemaId;
      data: unknown;
      profile?: string;
      metadata?: Record<string, unknown>;
    }[],
  ): Promise<ValidationBatchResult> {
    const start = Date.now();
    const results = await Promise.all(
      items.map(item =>
        this.validateById(item.schemaId, item.data, {
          profile: item.profile,
          metadata: item.metadata,
        }),
      ),
    );

    const passedCount = results.filter(r => r.passed).length;
    const totalExecutionTimeMs = Date.now() - start;

    return {
      results,
      totalCount: results.length,
      passedCount,
      failedCount: results.length - passedCount,
      averageScore:
        results.reduce((a, r) => a + r.score, 0) / results.length,
      totalExecutionTimeMs,
    };
  }

  async validateBatch(
    items: {
      schemaId: SchemaId;
      data: unknown;
      profile?: string;
      metadata?: Record<string, unknown>;
    }[],
  ): Promise<ValidationBatchResult> {
    return this.validateManyItems(items);
  }

  async validateOrThrow(
    schemaId: SchemaId,
    data: unknown,
    options?: {
      profile?: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<ValidationEngineResult> {
    const result = await this.validateById(schemaId, data, options);
    if (!result.passed) {
      throw new ValidationExecutionError(
        schemaId,
        result.issues.map(i => i.message).join('; '),
      );
    }
    return result;
  }

  supports(schemaId: SchemaId): Promise<boolean> {
    return Promise.resolve(this.registry.has(schemaId));
  }

  getStatistics(): ValidationMetrics {
    return this.statistics.getMetrics();
  }

  health(): {
    ok: boolean;
    details: {
      totalSchemas: number;
      compiledSchemas: number;
      totalValidations: number;
      failedValidations: number;
    };
    uptime: number;
  } {
    const stats = this.statistics.getMetrics();
    const registryStats = this.registry.statistics();
    return {
      ok: registryStats.totalSchemas > 0,
      details: {
        totalSchemas: registryStats.totalSchemas,
        compiledSchemas: registryStats.totalCompiled,
        totalValidations: stats.totalValidations,
        failedValidations: stats.failedValidations,
      },
      uptime: registryStats.uptime,
    };
  }

  private toLegacyResult(engineResult: ValidationEngineResult): ValidationResult {
    return {
      resultId: engineResult.resultId,
      entityId: engineResult.entityId ?? ('' as EntityId),
      passed: engineResult.passed,
      score: engineResult.score,
      issues: engineResult.issues.map(i => ({
        path: i.path,
        message: i.message,
        severity: i.severity,
        code: i.code,
      })),
      timestamp: engineResult.timestamp,
    };
  }
}
