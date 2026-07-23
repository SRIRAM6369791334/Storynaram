import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { DomainEventDispatcher } from '@storynaram/domain-kernel';
import { NarrativeFactory } from './narrative-factory.js';
import { NarrativeDomainService } from './narrative-domain-service.js';
import { NARRATIVE_REPOSITORY } from './narrative-repository.js';

@Global()
@Module({})
export class NarrativeDomainModule {
  static forRoot(): DynamicModule {
    const providers: Provider[] = [
      NarrativeFactory,
      NarrativeDomainService,
      DomainEventDispatcher,
    ];

    return {
      module: NarrativeDomainModule,
      providers,
      exports: [
        NarrativeFactory,
        NarrativeDomainService,
        DomainEventDispatcher,
        NARRATIVE_REPOSITORY,
      ],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: NarrativeDomainModule,
    };
  }
}
