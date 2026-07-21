import { Module, Logger } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@storynaram/config';
import { LoggerModule } from '@storynaram/logger';
import { EventBusModule } from '@storynaram/events';
import { TelemetryModule } from '@storynaram/telemetry';
import {
  AIRuntimeModule,
  AIProviderRegistry,
  MockProvider,
  AI_RUNTIME_OPTIONS,
  type AIRuntimeOptions,
  type AIProviderConfig,
  type AIProviderName,
} from '@storynaram/runtime';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { StoryModule } from './modules/story/story.module';
import { CharacterModule } from './modules/character/character.module';
import { WorldModule } from './modules/world/world.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { CanonModule } from './modules/canon/canon.module';
import { NarrativeModule } from './modules/narrative/narrative.module';
import { CompositionModule } from './modules/composition/composition.module';
import { PublishingModule } from './modules/publishing/publishing.module';
import { PlannerModule } from './modules/planner/planner.module';
import { GenerationModule } from './modules/generation/generation.module';
import { RevisionModule } from './modules/revision/revision.module';
import { PublishingAiModule } from './modules/publishing-ai/publishing-ai.module';
import { SearchModule } from './modules/search/search.module';
import { StorageModule } from './modules/storage/storage.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { JobsModule } from './jobs/jobs.module';
import { ApiModule } from './modules/api/api.module';

function buildAIProviders(): AIProviderConfig[] {
  const providers: AIProviderConfig[] = [];

  if (process.env.OPENAI_API_KEY) {
    providers.push({
      name: 'openai' as AIProviderName,
      displayName: 'OpenAI',
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
      organization: process.env.OPENAI_ORGANIZATION,
      defaultModel: 'gpt-4o',
    });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({
      name: 'anthropic' as AIProviderName,
      displayName: 'Anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseUrl: process.env.ANTHROPIC_BASE_URL ?? 'https://api.anthropic.com/v1',
      defaultModel: 'claude-sonnet-4-20250514',
    });
  }

  if (process.env.GEMINI_API_KEY) {
    providers.push({
      name: 'gemini' as AIProviderName,
      displayName: 'Google Gemini',
      apiKey: process.env.GEMINI_API_KEY,
      baseUrl: process.env.GEMINI_BASE_URL ?? 'https://generativelanguage.googleapis.com/v1beta',
      defaultModel: 'gemini-2.5-flash',
    });
  }

  if (process.env.OPENROUTER_API_KEY) {
    providers.push({
      name: 'openrouter' as AIProviderName,
      displayName: 'OpenRouter',
      apiKey: process.env.OPENROUTER_API_KEY,
      baseUrl: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
      defaultModel: 'openai/gpt-4o',
    });
  }

  if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_BASE_URL) {
    providers.push({
      name: 'azure' as AIProviderName,
      displayName: 'Azure OpenAI',
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      baseUrl: process.env.AZURE_OPENAI_BASE_URL,
      defaultModel: 'gpt-4o',
    });
  }

  if (process.env.CUSTOM_AI_API_KEY) {
    providers.push({
      name: 'custom' as AIProviderName,
      displayName: 'Custom AI',
      apiKey: process.env.CUSTOM_AI_API_KEY,
      baseUrl: process.env.CUSTOM_AI_BASE_URL,
      defaultModel: 'default',
    });
  }

  providers.push({
    name: 'ollama' as AIProviderName,
    displayName: 'Ollama',
    baseUrl: process.env.OLLAMA_HOST ?? 'http://localhost:11434',
    defaultModel: process.env.OLLAMA_DEFAULT_MODEL ?? 'llama3.2',
  });

  return providers;
}

function buildAIProviderOptions(): AIRuntimeOptions {
  const fallbackProviders = process.env.AI_FALLBACK_PROVIDERS?.split(',').filter(Boolean) as AIProviderName[] | undefined;
  const fallbackModels = process.env.AI_FALLBACK_MODELS?.split(',').filter(Boolean);
  const aiRetryMax = Number(process.env.AI_RETRY_MAX) || 3;

  return {
    defaultProvider: (process.env.AI_PROVIDER ?? 'mock') as AIProviderName,
    defaultModel: process.env.AI_MODEL ?? 'mock-model',
    enableCache: process.env.AI_ENABLE_CACHE !== 'false',
    enableStatistics: true,
    enableCostTracking: true,
    cacheTtlMs: Number(process.env.AI_CACHE_TTL_MS) || 300000,
    defaultRetry: {
      maxRetries: aiRetryMax,
      baseDelayMs: 200,
      maxDelayMs: 10000,
      backoffMultiplier: 2,
    },
    defaultFallback: (fallbackProviders && fallbackProviders.length > 0) || (fallbackModels && fallbackModels.length > 0)
      ? {
          providers: fallbackProviders ?? ['mock'],
          models: fallbackModels ?? ['mock-model'],
          timeoutMs: 30000,
        }
      : undefined,
    providers: buildAIProviders(),
  };
}

@Module({
  imports: [
    ThrottlerModule.forRoot({ throttlers: [{ limit: 100, ttl: 60000 }] }),
    ConfigModule.forRoot(),
    LoggerModule.forRoot(),
    EventBusModule.forRoot(),
    TelemetryModule.forRoot(),
    AIRuntimeModule.forRoot(buildAIProviderOptions()),
    AuthModule,
    HealthModule,
    MonitoringModule,
    StoryModule,
    CharacterModule,
    WorldModule,
    TimelineModule,
    CanonModule,
    NarrativeModule,
    CompositionModule,
    PublishingModule,
    PlannerModule,
    GenerationModule,
    RevisionModule,
    PublishingAiModule,
    SearchModule,
    StorageModule,
    RealtimeModule,
    JobsModule,
    ApiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'AI_PROVIDER_REGISTRATION',
      useFactory: (registry: AIProviderRegistry, options: AIRuntimeOptions) => {
        const logger = new Logger('AIProviderRegistration');
        for (const providerConfig of options.providers ?? []) {
          try {
            const provider = registry.createProvider(providerConfig);
            registry.register(provider);
            logger.log(`Registered provider: ${providerConfig.name}`);
          } catch (err) {
            logger.warn(`Failed to register provider ${providerConfig.name}: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
        if (!registry.has('mock')) {
          registry.register(new MockProvider({}));
          logger.log('Registered provider: mock');
        }
        logger.log(`AI providers registered: ${registry.listNames().join(', ')}`);
        return true;
      },
      inject: [AIProviderRegistry, AI_RUNTIME_OPTIONS],
    },
  ],
})
export class AppModule {}
