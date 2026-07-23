import { DynamicModule, Module } from '@nestjs/common';
import { RuntimeConfig } from './runtime-config.js';
import { EntityCacheService } from './entity-cache.service.js';
import { EntityEventService } from './entity-event.service.js';
import { EntityValidationService } from './entity-validation.service.js';
import { EntityLifecycleService } from './entity-lifecycle.service.js';
import type { EntityRuntimeOptions } from './types.js';

@Module({})
export class RuntimeModule {
  static forRoot(options?: EntityRuntimeOptions): DynamicModule {
    const config = new RuntimeConfig(options);
    return {
      module: RuntimeModule,
      global: true,
      providers: [
        { provide: RuntimeConfig, useValue: config },
        EntityCacheService,
        EntityEventService,
        EntityValidationService,
        EntityLifecycleService,
      ],
      exports: [
        RuntimeConfig,
        EntityCacheService,
        EntityEventService,
        EntityValidationService,
        EntityLifecycleService,
      ],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: RuntimeModule,
      providers: [
        EntityCacheService,
        EntityEventService,
        EntityValidationService,
        EntityLifecycleService,
      ],
      exports: [
        EntityCacheService,
        EntityEventService,
        EntityValidationService,
        EntityLifecycleService,
      ],
    };
  }
}
