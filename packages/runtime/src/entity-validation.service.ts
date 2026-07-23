import { Injectable, Logger } from '@nestjs/common';
import type { SchemaRegistryService, SchemaId } from '@storynaram/schemas';
import type { ValidationEngineService } from '@storynaram/validation';
import type { EntityId } from '@storynaram/core';
import { EntityValidationError } from './errors.js';
import { RuntimeConfig } from './runtime-config.js';

@Injectable()
export class EntityValidationService {
  private readonly logger = new Logger(EntityValidationService.name);

  constructor(
    private readonly registry: SchemaRegistryService,
    private readonly validationEngine: ValidationEngineService,
    private readonly config: RuntimeConfig,
  ) {}

  async validate<T extends Record<string, unknown>>(
    entityType: string,
    data: T,
    entityId?: EntityId,
  ): Promise<{ passed: boolean; errors: string[]; score: number }> {
    if (!this.config.enableValidation) {
      return { passed: true, errors: [], score: 1 };
    }

    const schemaId = this.resolveSchemaId(entityType);
    if (!schemaId) {
      this.logger.warn(`No schema found for entity type ${entityType}, skipping validation`);
      return { passed: true, errors: [], score: 1 };
    }

    const result = await this.validationEngine.validateById(
      schemaId,
      data as Record<string, unknown>,
      { entityId },
    );

    return {
      passed: result.passed,
      errors: result.issues.map((i: { path: string; message: string }) => `${i.path}: ${i.message}`),
      score: result.score,
    };
  }

  async validateOrThrow<T extends Record<string, unknown>>(
    entityType: string,
    data: T,
    entityId?: EntityId,
  ): Promise<void> {
    const result = await this.validate(entityType, data, entityId);
    if (!result.passed) {
      throw new EntityValidationError(entityType, result.errors);
    }
  }

  private resolveSchemaId(entityType: string): SchemaId | undefined {
    const title = this.capitalize(entityType);
    const category = this.detectCategory(entityType);

    if (category) {
      const id = `${category}/${title}.schema.json` as SchemaId;
      if (this.registry.has(id)) return id;
    }

    const id = `domain/${title}.schema.json` as SchemaId;
    if (this.registry.has(id)) return id;

    const coreId = `core/${title}.schema.json` as SchemaId;
    if (this.registry.has(coreId)) return coreId;

    const matches = this.registry.find({ title });
    if (matches.length > 0) {
      return matches[0]!.$id;
    }

    return undefined;
  }

  private detectCategory(entityType: string): string | undefined {
    const coreTypes = new Set([
      'baseentity', 'baseidentifier', 'basemetadata', 'baseaudit',
      'baseversion', 'basestatus', 'baselifecycle', 'baseownership',
      'basereference', 'baserelationship', 'basetag', 'basevisibility',
      'basepermission', 'baselocalization', 'baseattachment', 'basecomment',
      'basehistory', 'basevalidation', 'baseai', 'basesearch',
      'basesecurity', 'baseworkflow', 'baseextension',
    ]);
    if (coreTypes.has(entityType.toLowerCase())) return 'core';
    return 'domain';
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
