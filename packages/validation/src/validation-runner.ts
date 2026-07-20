import { Injectable, Logger } from '@nestjs/common';
import { SchemaCompilerService, SchemaCacheService } from '@storynaram/schemas';
import type { SchemaId } from '@storynaram/schemas';
import type { ValidateFunction } from 'ajv';

@Injectable()
export class ValidationRunner {
  private readonly logger = new Logger(ValidationRunner.name);

  constructor(
    private readonly compiler: SchemaCompilerService,
    private readonly cache: SchemaCacheService,
  ) {}

  run(
    schemaId: SchemaId,
    data: unknown,
  ): {
    valid: boolean;
    errors?: { instancePath: string; message?: string; keyword?: string }[];
  } {
    const cached = this.cache.getCompiled(schemaId) as ValidateFunction | undefined;

    if (!cached) {
      const result = this.compiler.compile(schemaId);
      if (!result.success) {
        return {
          valid: false,
          errors: [
            {
              instancePath: '',
              message: `Schema ${schemaId} not compiled: ${result.errors?.join(', ') ?? ''}`,
              keyword: 'error',
            },
          ],
        };
      }
    }

    const validate = this.cache.getCompiled(schemaId) as ValidateFunction | undefined;
    if (!validate) {
      return {
        valid: false,
        errors: [
          {
            instancePath: '',
            message: `Schema ${schemaId} not available`,
            keyword: 'error',
          },
        ],
      };
    }

    const valid = validate(data);
    if (!valid && validate.errors) {
      return {
        valid: false,
        errors: validate.errors.map(e => ({
          instancePath: e.instancePath,
          message: e.message ?? 'Validation error',
          keyword: e.keyword,
        })),
      };
    }

    return { valid: true };
  }
}
