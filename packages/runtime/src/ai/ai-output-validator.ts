import { Injectable, Logger, Optional } from '@nestjs/common';
import type { AIResponse, AIOutputValidationOptions } from './types';
import { AIValidationError } from './errors';
import type { ValidationEngineService, SchemaId } from '@storynaram/validation';

@Injectable()
export class AIOutputValidator {
  private readonly logger = new Logger(AIOutputValidator.name);

  constructor(
    @Optional() private readonly validationEngine?: ValidationEngineService,
  ) {}

  async validate(
    response: AIResponse,
    options?: AIOutputValidationOptions,
  ): Promise<{ valid: boolean; issues: string[] }> {
    if (!options?.schemaId && !options?.schema) {
      return { valid: true, issues: [] };
    }

    const content = response.messages[0]?.content;
    if (!content) {
      return { valid: false, issues: ['No content to validate'] };
    }

    let data: unknown;
    try {
      data = JSON.parse(content) as unknown;
    } catch {
      return { valid: false, issues: ['Response content is not valid JSON for schema validation'] };
    }

    if (options.schemaId && this.validationEngine) {
      try {
        const result = await this.validationEngine.validateById(options.schemaId as SchemaId, data);
        const issues = result.issues.map(i => `${i.path}: ${i.message}`);
        return { valid: result.passed, issues };
      } catch (error) {
        this.logger.error(`Schema validation error for ${options.schemaId}`, error);
        return { valid: false, issues: [error instanceof Error ? error.message : String(error)] };
      }
    }

    if (options.schema) {
      const issues: string[] = [];
      if (typeof data !== 'object' || data === null) {
        issues.push('Response is not an object');
      }
      if (options.schema.required && Array.isArray(options.schema.required)) {
        const dataObj = data as Record<string, unknown>;
        for (const field of options.schema.required as string[]) {
          if (!(field in dataObj) || dataObj[field] === undefined) {
            issues.push(`Missing required field: ${field}`);
          }
        }
      }
      return { valid: issues.length === 0, issues };
    }

    return { valid: true, issues: [] };
  }

  async validateWithRetry(
    response: AIResponse,
    options?: AIOutputValidationOptions,
    maxRetries: number = 3,
  ): Promise<{ valid: boolean; issues: string[]; attempts: number }> {
    let attempts = 0;
    let issues: string[] = [];

    while (attempts <= maxRetries) {
      const result = await this.validate(response, options);
      issues = result.issues;

      if (result.valid) {
        return { valid: true, issues: [], attempts };
      }

      attempts++;
      if (attempts > maxRetries) break;
    }

    return { valid: false, issues, attempts };
  }
}
