import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { DomainEventDispatcher } from '@storynaram/domain-kernel';
import { StoryFactory } from './story-factory.js';
import { StoryDomainService } from './story-domain-service.js';
import { CompositionEngine } from './composition-engine.js';
import { CompositionValidator } from './composition-validator.js';
import { CompositionAnalyzer } from './composition-analyzer.js';
import { STORY_REPOSITORY } from './story-repository.js';

@Global()
@Module({})
export class StoryCompositionDomainModule {
  static forRoot(): DynamicModule {
    const providers: Provider[] = [
      StoryFactory,
      StoryDomainService,
      CompositionEngine,
      CompositionValidator,
      CompositionAnalyzer,
      DomainEventDispatcher,
    ];

    return {
      module: StoryCompositionDomainModule,
      providers,
      exports: [
        StoryFactory,
        StoryDomainService,
        CompositionEngine,
        CompositionValidator,
        CompositionAnalyzer,
        DomainEventDispatcher,
        STORY_REPOSITORY,
      ],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: StoryCompositionDomainModule,
    };
  }
}
