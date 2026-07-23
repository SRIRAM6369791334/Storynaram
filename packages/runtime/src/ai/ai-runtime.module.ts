import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { AI_RUNTIME_OPTIONS } from './tokens.js';
import type { AIRuntimeOptions } from './types.js';
import { AIRuntimeService } from './ai-engine.service.js';
import { AIProviderRegistry } from './ai-provider-registry.service.js';
import { AIModelRegistry } from './ai-model-registry.service.js';
import { AIPromptBuilder } from './ai-prompt-builder.js';
import { AIPromptTemplateManager } from './ai-prompt-template.js';
import { AISessionManager } from './ai-session.manager.js';
import { AIToolRegistry } from './tools/ai-tool-registry.js';
import { AIToolExecutor } from './tools/ai-tool-executor.js';
import { AIStreamingSession } from './streaming/ai-streaming-session.js';
import { AICacheService } from './ai-cache.service.js';
import { AICostTracker } from './ai-cost-tracker.service.js';
import { AIStatisticsService } from './ai-statistics.service.js';
import { AIOutputValidator } from './ai-output-validator.js';
import { AIRetryPolicy } from './ai-retry-policy.service.js';
import { AIFallbackPolicy } from './ai-fallback-policy.service.js';
import { MockProvider } from './providers/mock.provider.js';

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
      {
        provide: AIStatisticsService,
        useFactory: () => new AIStatisticsService(),
      },
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
        AI_RUNTIME_OPTIONS,
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
      {
        provide: AIStatisticsService,
        useFactory: () => new AIStatisticsService(),
      },
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
