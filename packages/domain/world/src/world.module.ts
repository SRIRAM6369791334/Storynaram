import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { DomainEventDispatcher } from '@storynaram/domain-kernel';
import { WorldFactory } from './world-factory.js';
import { WorldDomainService } from './world-domain-service.js';
import { WORLD_REPOSITORY } from './world-repository.js';

@Global()
@Module({})
export class WorldDomainModule {
  static forRoot(): DynamicModule {
    const providers: Provider[] = [
      WorldFactory,
      WorldDomainService,
      DomainEventDispatcher,
    ];

    return {
      module: WorldDomainModule,
      providers,
      exports: [
        WorldFactory,
        WorldDomainService,
        DomainEventDispatcher,
        WORLD_REPOSITORY,
      ],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: WorldDomainModule,
    };
  }
}
