import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { DomainEventDispatcher } from '@storynaram/domain-kernel';
import { StoryFactory } from './story-factory';
import { StoryDomainService } from './story-domain-service';
import { CompositionEngine } from './composition-engine';
import { CompositionValidator } from './composition-validator';
import { CompositionAnalyzer } from './composition-analyzer';
import { STORY_REPOSITORY } from './story-repository';

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
