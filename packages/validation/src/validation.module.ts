import type { DynamicModule } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import type { ValidationEngineOptions } from './types';
import { ValidationEngineService } from './validation-engine.service';
import { ValidationRunner } from './validation-runner';
import { ValidationPipeline } from './validation-pipeline';
import { ValidationProfileService } from './validation-profile.service';
import { ValidationResultFactory } from './validation-result.factory';
import { ValidationStatisticsService } from './validation-statistics.service';
import { ValidationCache } from './validation-cache';

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
