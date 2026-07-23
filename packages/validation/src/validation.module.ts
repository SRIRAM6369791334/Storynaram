import type { DynamicModule } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import type { ValidationEngineOptions } from './types.js';
import { ValidationEngineService } from './validation-engine.service.js';
import { ValidationRunner } from './validation-runner.js';
import { ValidationPipeline } from './validation-pipeline.js';
import { ValidationProfileService } from './validation-profile.service.js';
import { ValidationResultFactory } from './validation-result.factory.js';
import { ValidationStatisticsService } from './validation-statistics.service.js';
import { ValidationCache } from './validation-cache.js';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ValidationModule {
  static forRoot(options?: ValidationEngineOptions): DynamicModule {
    return {
      module: ValidationModule,
      global: true,
      providers: [
        { provide: 'VALIDATION_OPTIONS', useValue: options ?? {} },
        Logger,
        ValidationCache,
        ValidationProfileService,
        ValidationResultFactory,
        ValidationStatisticsService,
        ValidationRunner,
        ValidationPipeline,
        ValidationEngineService,
      ],
      exports: [
        ValidationEngineService,
        ValidationRunner,
        ValidationPipeline,
        ValidationProfileService,
        ValidationStatisticsService,
        ValidationCache,
      ],
    };
  }
}
