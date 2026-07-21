import { Module } from '@nestjs/common';
import { AIRuntimeService } from '@storynaram/runtime';
import { StoryGenerationEngine } from '@storynaram/story-generator';
import { GenerationController } from './generation.controller';
import { GenerationService } from './generation.service';

@Module({
  controllers: [GenerationController],
  providers: [
    GenerationService,
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
