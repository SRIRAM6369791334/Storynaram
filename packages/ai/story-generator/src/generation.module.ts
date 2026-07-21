import { Module, Global, type DynamicModule } from '@nestjs/common';
import { AIRuntimeService } from '@storynaram/runtime';
import { StoryGenerationEngine, type EngineOptions } from './story-generation-engine';
import { PromptAssembler } from './prompt/prompt-assembler';
import { PromptOptimizer } from './prompt/prompt-optimizer';
import { ContextBuilder } from './prompt/context-builder';
import { OutputAssembler } from './output/output-assembler';
import { StreamingCoordinator } from './output/streaming-coordinator';
import { TokenBudgetManager } from './selection/token-budget-manager';
import { ModelSelector } from './selection/model-selector';
import { ProviderSelector } from './selection/provider-selector';

export interface GenerationModuleOptions {
  engine?: Partial<EngineOptions>;
  isGlobal?: boolean;
}

@Global()
@Module({})
export class GenerationModule {
  static forRoot(options?: GenerationModuleOptions): DynamicModule {
    return {
      module: GenerationModule,
      global: options?.isGlobal ?? true,
      providers: [
        {
          provide: StoryGenerationEngine,
          useFactory: (aiRuntime: AIRuntimeService) => {
            return new StoryGenerationEngine(aiRuntime, options?.engine);
          },
          inject: [AIRuntimeService],
        },
        PromptAssembler,
        PromptOptimizer,
        ContextBuilder,
        OutputAssembler,
        StreamingCoordinator,
        TokenBudgetManager,
        ModelSelector,
        ProviderSelector,
      ],
      exports: [StoryGenerationEngine],
    };
  }

  static forFeature(options?: GenerationModuleOptions): DynamicModule {
    return {
      module: GenerationModule,
      providers: [
        {
          provide: StoryGenerationEngine,
          useFactory: (aiRuntime: AIRuntimeService) => {
            return new StoryGenerationEngine(aiRuntime, options?.engine);
          },
          inject: [AIRuntimeService],
        },
        PromptAssembler,
        PromptOptimizer,
        ContextBuilder,
        OutputAssembler,
        StreamingCoordinator,
        TokenBudgetManager,
        ModelSelector,
        ProviderSelector,
      ],
      exports: [StoryGenerationEngine],
    };
  }
}
