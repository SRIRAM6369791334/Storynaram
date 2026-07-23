import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { DomainEventDispatcher } from '@storynaram/domain-kernel';
import { TimelineFactory } from './timeline-factory.js';
import { TimelineDomainService } from './timeline-domain-service.js';
import { TIMELINE_REPOSITORY } from './timeline-repository.js';

@Global()
@Module({})
export class TimelineDomainModule {
  static forRoot(): DynamicModule {
    const providers: Provider[] = [
      TimelineFactory,
      TimelineDomainService,
      DomainEventDispatcher,
    ];

    return {
      module: TimelineDomainModule,
      providers,
      exports: [
        TimelineFactory,
        TimelineDomainService,
        DomainEventDispatcher,
        TIMELINE_REPOSITORY,
      ],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: TimelineDomainModule,
    };
  }
}
