import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { AI_RUNTIME_OPTIONS } from './tokens';
import type { AIRuntimeOptions } from './types';
import { AIRuntimeService } from './ai-engine.service';
import { AIProviderRegistry } from './ai-provider-registry.service';
import { AIModelRegistry } from './ai-model-registry.service';
import { AIPromptBuilder } from './ai-prompt-builder';
import { AIPromptTemplateManager } from './ai-prompt-template';
import { AISessionManager } from './ai-session.manager';
import { AIToolRegistry } from './tools/ai-tool-registry';
import { AIToolExecutor } from './tools/ai-tool-executor';
import { AIStreamingSession } from './streaming/ai-streaming-session';
import { AICacheService } from './ai-cache.service';
import { AICostTracker } from './ai-cost-tracker.service';
import { AIStatisticsService } from './ai-statistics.service';
import { AIOutputValidator } from './ai-output-validator';
import { AIRetryPolicy } from './ai-retry-policy.service';
import { AIFallbackPolicy } from './ai-fallback-policy.service';
import { MockProvider } from './providers/mock.provider';

const DEFAULT_OPTIONS: AIRuntimeOptions = {
  defaultProvider: 'mock',
  defaultModel: 'mock-model',
  enableCache: true,
  enableStatistics: true,
  enableCostTracking: true,
  defaultRetry: {
    maxRetries: 3,
    baseDelayMs: 200,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
  },
  cacheTtlMs: 300000,
};

@Global()
@Module({})
export class AIRuntimeModule {
  static forRoot(options?: AIRuntimeOptions): DynamicModule {
    const resolvedOptions: AIRuntimeOptions = { ...DEFAULT_OPTIONS, ...options };

    const providers: Provider[] = [
      { provide: AI_RUNTIME_OPTIONS, useValue: resolvedOptions },
      AIRuntimeService,
      AIProviderRegistry,
      AIModelRegistry,
      AIPromptBuilder,
      AIPromptTemplateManager,
      AISessionManager,
      AIToolRegistry,
      AIToolExecutor,
      AIStreamingSession,
      {
        provide: AICacheService,
        useFactory: () => new AICacheService(resolvedOptions.cacheTtlMs ?? 300000),
      },
      AICostTracker,
      AIStatisticsService,
      AIOutputValidator,
      AIRetryPolicy,
      AIFallbackPolicy,
      {
        provide: MockProvider,
        useFactory: () => new MockProvider({}),
      },
    ];

    return {
      module: AIRuntimeModule,
      global: true,
      providers,
      exports: [
        AIRuntimeService,
        AIProviderRegistry,
        AIModelRegistry,
        AIPromptBuilder,
        AIPromptTemplateManager,
        AISessionManager,
        AIToolRegistry,
        AIToolExecutor,
        AIStreamingSession,
        AICacheService,
        AICostTracker,
        AIStatisticsService,
        AIOutputValidator,
        AIRetryPolicy,
        AIFallbackPolicy,
        MockProvider,
      ],
    };
  }

  static forFeature(): DynamicModule {
    const providers: Provider[] = [
      AIRuntimeService,
      AIProviderRegistry,
      AIModelRegistry,
      AIPromptBuilder,
      AIPromptTemplateManager,
      AISessionManager,
      AIToolRegistry,
      AIToolExecutor,
      AIStreamingSession,
      {
        provide: AICacheService,
        useFactory: () => new AICacheService(300000),
      },
      AICostTracker,
      AIStatisticsService,
      AIOutputValidator,
      AIRetryPolicy,
      AIFallbackPolicy,
      {
        provide: MockProvider,
        useFactory: () => new MockProvider({}),
      },
    ];

    return {
      module: AIRuntimeModule,
      providers,
      exports: providers,
    };
  }
}
