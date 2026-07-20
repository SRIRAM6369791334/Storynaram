import { Injectable, Logger } from '@nestjs/common';
import { SchemaRegistryService } from '@storynaram/schemas';
import type { SchemaId } from '@storynaram/schemas';
import { ValidationRunner } from './validation-runner';
import { ValidationResultFactory } from './validation-result.factory';
import { ValidationProfileService } from './validation-profile.service';
import type { ValidationEngineResult, ValidationContextData } from './types';

@Injectable()
export class ValidationPipeline {
  private readonly logger = new Logger(ValidationPipeline.name);

  constructor(
    private readonly registry: SchemaRegistryService,
    private readonly runner: ValidationRunner,
    private readonly resultFactory: ValidationResultFactory,
    private readonly profileService: ValidationProfileService,
  ) {}

  execute(
    schemaId: SchemaId,
    data: unknown,
    profileName?: string,
    metadata?: Record<string, unknown>,
  ): Promise<ValidationEngineResult> {
    const profileNameResolved = profileName ?? 'default';
    const profile = this.profileService.getProfile(profileNameResolved);

    const context: ValidationContextData = {
      schemaId,
      data,
      profileName: profileNameResolved,
      profile,
      metadata,
    };

    const meta = this.registry.get(schemaId);

    this.logger.debug(`Validating ${schemaId} with profile "${profileNameResolved}"`);

    const start = Date.now();
    const result = this.runner.run(schemaId, data);
    const executionTimeMs = Date.now() - start;

    if (result.valid) {
      return Promise.resolve(this.resultFactory.createSuccess(context, meta, executionTimeMs, metadata));
    }

    return Promise.resolve(
      this.resultFactory.createFailure(
        context,
        result.errors ?? [],
        meta,
        executionTimeMs,
        metadata,
      ),
    );
  }
}
