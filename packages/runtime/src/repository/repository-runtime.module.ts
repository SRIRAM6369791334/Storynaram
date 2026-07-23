import { DynamicModule, Module, Inject } from '@nestjs/common';
import { RepositoryRegistry } from './repository-registry.js';
import { RepositoryFactory } from './repository-factory.js';
import { RepositoryManager } from './repository-manager.js';
import { RepositoryContext } from './repository-context.js';
import type { RepositoryOptions } from './types.js';
import { RUNTIME_REPOSITORY_OPTIONS } from './tokens.js';

@Module({})
export class RepositoryRuntimeModule {
  static forRoot(options?: RepositoryOptions): DynamicModule {
    return {
      module: RepositoryRuntimeModule,
      global: true,
      providers: [
        { provide: RUNTIME_REPOSITORY_OPTIONS, useValue: options ?? {} },
        RepositoryRegistry,
        RepositoryFactory,
        RepositoryManager,
        RepositoryContext,
      ],
      exports: [
        RepositoryRegistry,
        RepositoryFactory,
        RepositoryManager,
        RepositoryContext,
      ],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: RepositoryRuntimeModule,
      providers: [
        RepositoryRegistry,
        RepositoryFactory,
        RepositoryManager,
        RepositoryContext,
      ],
      exports: [
        RepositoryRegistry,
        RepositoryFactory,
        RepositoryManager,
        RepositoryContext,
      ],
    };
  }
}
