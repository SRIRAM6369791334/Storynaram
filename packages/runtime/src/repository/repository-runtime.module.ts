import { DynamicModule, Module, Inject } from '@nestjs/common';
import { RepositoryRegistry } from './repository-registry';
import { RepositoryFactory } from './repository-factory';
import { RepositoryManager } from './repository-manager';
import { RepositoryContext } from './repository-context';
import type { RepositoryOptions } from './types';
import { RUNTIME_REPOSITORY_OPTIONS } from './tokens';

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
