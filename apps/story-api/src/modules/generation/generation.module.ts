import { Module } from '@nestjs/common';
import { AIRuntimeService } from '@storynaram/runtime';
import { StoryGenerationEngine } from '@storynaram/story-generator';
import { StoryModule } from '../story/story.module';
import { CharacterModule } from '../character/character.module';
import { WorldModule } from '../world/world.module';
import { TimelineModule } from '../timeline/timeline.module';
import { CanonModule } from '../canon/canon.module';
import { NarrativeModule } from '../narrative/narrative.module';
import { CompositionModule } from '../composition/composition.module';
import { GenerationController } from './generation.controller';
import { GenerationService } from './generation.service';
import { GenerationDataLoader } from './generation-data-loader';

@Module({
  imports: [
    StoryModule,
    CharacterModule,
    WorldModule,
    TimelineModule,
    CanonModule,
    NarrativeModule,
    CompositionModule,
  ],
  controllers: [GenerationController],
  providers: [
    GenerationService,
    GenerationDataLoader,
    {
      provide: StoryGenerationEngine,
      useFactory: (aiRuntime: AIRuntimeService) => {
        return new StoryGenerationEngine(aiRuntime, {
          defaultModel: process.env.AI_MODEL ?? 'mock-model',
          defaultProvider: process.env.AI_PROVIDER ?? 'mock',
        });
      },
      inject: [AIRuntimeService],
    },
  ],
  exports: [GenerationService, StoryGenerationEngine],
})
export class GenerationModule {}
