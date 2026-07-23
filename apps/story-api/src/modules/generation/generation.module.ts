import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AIRuntimeService } from '@storynaram/runtime';
import { StoryGenerationEngine } from '@storynaram/story-generator';
import { JobsModule } from '../../jobs/jobs.module.js';
import { StoryModule } from '../story/story.module.js';
import { CharacterModule } from '../character/character.module.js';
import { WorldModule } from '../world/world.module.js';
import { TimelineModule } from '../timeline/timeline.module.js';
import { CanonModule } from '../canon/canon.module.js';
import { NarrativeModule } from '../narrative/narrative.module.js';
import { CompositionModule } from '../composition/composition.module.js';
import { GenerationController } from './generation.controller.js';
import { GenerationService } from './generation.service.js';
import { GenerationDataLoader } from './generation-data-loader.js';

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
