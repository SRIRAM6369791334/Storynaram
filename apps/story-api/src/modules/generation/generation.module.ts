import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AIRuntimeService } from '@storynaram/runtime';
import { StoryGenerationEngine } from '@storynaram/story-generator';
import { JobsModule } from '../../jobs/jobs.module';
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
    BullModule.registerQueue({ name: 'story-generation' }),
    forwardRef(() => JobsModule),
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
  exports: [GenerationService, StoryGenerationEngine, GenerationDataLoader],
})
export class GenerationModule {}
