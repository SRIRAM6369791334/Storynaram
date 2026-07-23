import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { AIRequest, AIResponse, AIStreamChunk, AISession, AIGenerateOptions, AIProviderName, AIProviderFallbackEvent, AIRequestStartedEvent, AIRequestCompletedEvent, AIRequestFailedEvent, AIToolExecutedEvent, AIRuntimeOptions, AIRetryConfig } from './types.js';
import { AIProviderRegistry } from './ai-provider-registry.service.js';
import { AIModelRegistry } from './ai-model-registry.service.js';
import { AIPromptBuilder } from './ai-prompt-builder.js';
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
import { AI_RUNTIME_OPTIONS, AI_DEFAULT_PROVIDER, AI_DEFAULT_MODEL } from './tokens.js';
import { AIProvider } from './providers/ai-provider.interface.js';
import type { EventBusPort } from '@storynaram/events';
import { AIRuntimeError, AIProviderError, AIFallbackExhaustedError } from './errors.js';

@Injectable()
export class AIRuntimeService {
  private readonly logger = new Logger(AIRuntimeService.name);

  constructor(
    private readonly providerRegistry: AIProviderRegistry,
    private readonly modelRegistry: AIModelRegistry,
    private readonly promptBuilder: AIPromptBuilder,
    private readonly sessionManager: AISessionManager,
    private readonly toolRegistry: AIToolRegistry,
    private readonly toolExecutor: AIToolExecutor,
    private readonly streamingSession: AIStreamingSession,
    private readonly cacheService: AICacheService,
    private readonly costTracker: AICostTracker,
    private readonly statisticsService: AIStatisticsService,
    private readonly outputValidator: AIOutputValidator,
    private readonly retryPolicy: AIRetryPolicy,
    private readonly fallbackPolicy: AIFallbackPolicy,
    @Inject(AI_RUNTIME_OPTIONS) private readonly options: AIRuntimeOptions,
    @Optional() private readonly eventBus?: EventBusPort,
  ) {}

  async generate(request: AIRequest, options?: AIGenerateOptions): Promise<AIResponse> {
    const requestId = uuid();
    const effectiveOptions = this.mergeOptions(options);
    const providerName = effectiveOptions.provider ?? this.options.defaultProvider ?? 'mock';
    const model = effectiveOptions.model ?? request.model ?? this.options.defaultModel ?? 'mock-model';

    const resolvedRequest: AIRequest = {
      ...request,
      provider: providerName,
      model,
      stream: false,
      temperature: effectiveOptions.temperature ?? request.temperature,
      maxTokens: effectiveOptions.maxTokens ?? request.maxTokens,
    };

    if (effectiveOptions.tools && effectiveOptions.tools.length > 0) {
      for (const tool of effectiveOptions.tools) {
        if (!this.toolRegistry.has(tool.name)) {
          this.toolRegistry.register(tool);
        }
      }
      resolvedRequest.tools = this.toolRegistry.listDefinitions();
    }

    await this.publishEvent('AIRequestStarted', {
      requestId,
      provider: providerName,
      model,
      timestamp: new Date(),
      metadata: effectiveOptions.metadata,
    });

    const startTime = Date.now();

    try {
      if (effectiveOptions.cache !== false && this.options.enableCache !== false) {
        const cacheKey = this.cacheService.generateKey(resolvedRequest);
        const cached = this.cacheService.get(cacheKey);
        if (cached) {
          this.statisticsService.record(providerName, 0, true, 0);
          await this.publishEvent('AIRequestCompleted', {
            requestId,
            provider: providerName,
            model,
            timestamp: new Date(),
            tokenUsage: cached.tokenUsage,
            latencyMs: 0,
            metadata: { ...effectiveOptions.metadata, cached: true },
          });
          return cached;
        }
      }

      const response = await this.executeWithPolicies(resolvedRequest, effectiveOptions);

      const latencyMs = Date.now() - startTime;
      this.statisticsService.record(providerName, latencyMs, true, response.tokenUsage.totalTokens);
      const cost = this.costTracker.track(providerName, model, response.tokenUsage);

      if (effectiveOptions.cache !== false && this.options.enableCache !== false) {
        const cacheKey = this.cacheService.generateKey(resolvedRequest);
        this.cacheService.set(cacheKey, response);
      }

      if (effectiveOptions.sessionId) {
        this.sessionManager.addMessage(effectiveOptions.sessionId, { role: 'assistant', content: response.messages[0]?.content ?? '' });
      }

      if (effectiveOptions.outputValidation) {
        const validation = await this.outputValidator.validate(response, effectiveOptions.outputValidation);
        if (!validation.valid) {
          this.logger.warn(`Output validation failed for request ${requestId}: ${validation.issues.join(', ')}`);
        }
      }

      await this.publishEvent('AIRequestCompleted', {
        requestId,
        provider: providerName,
        model,
        timestamp: new Date(),
        tokenUsage: response.tokenUsage,
        latencyMs,
        metadata: effectiveOptions.metadata,
      });

      return response;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.statisticsService.record(providerName, latencyMs, false, 0);

      await this.publishEvent('AIRequestFailed', {
        requestId,
        provider: providerName,
        model,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
        metadata: effectiveOptions.metadata,
      });

      throw error;
    }
  }

  async *generateStream(request: AIRequest, options?: AIGenerateOptions): AsyncGenerator<AIStreamChunk> {
    const effectiveOptions = this.mergeOptions(options);
    const providerName = effectiveOptions.provider ?? this.options.defaultProvider ?? 'mock';
    const model = effectiveOptions.model ?? request.model ?? this.options.defaultModel ?? 'mock-model';
    const provider = this.providerRegistry.resolve(providerName);

    const resolvedRequest: AIRequest = {
      ...request,
      provider: providerName,
      model,
      stream: true,
    };

    const streamSession = this.streamingSession;
    let completedResponse: AIResponse | null = null;

    const streamPromise = streamSession.stream(provider, resolvedRequest, {
      onChunk: (chunk) => {
        // pass through chunks
      },
      onComplete: (response) => {
        completedResponse = response;
      },
      onError: (error) => {
        this.logger.error(`Stream error for ${providerName}/${model}:`, error);
      },
    }, effectiveOptions.fallback?.timeoutMs);

    try {
      const generator = provider.generateStream(resolvedRequest);
      for await (const chunk of generator) {
        yield chunk;
      }
    } finally {
      const response = await streamPromise.catch(() => null);
      if (response) {
        this.statisticsService.record(providerName, response.latencyMs, true, response.tokenUsage.totalTokens);
        this.costTracker.track(providerName, model, response.tokenUsage);
      }
    }
  }

  async createSession(systemPrompt?: string, metadata?: Record<string, unknown>): Promise<AISession> {
    return this.sessionManager.createSession({
      systemPrompt,
      metadata,
      maxMessages: 100,
    });
  }

  async getSession(sessionId: string): Promise<AISession | undefined> {
    return this.sessionManager.getSession(sessionId);
  }

  async listSessions(): Promise<AISession[]> {
    return this.sessionManager.listSessions();
  }

  async addMessageToSession(sessionId: string, role: 'user' | 'assistant' | 'system', content: string): Promise<void> {
    this.sessionManager.addMessage(sessionId, { role, content });
  }

  registerTool(...tools: import('./types').AITool[]): void {
    this.toolRegistry.registerMany(tools);
  }

  getStatistics(): import('./types').AIStatistics {
    return this.statisticsService.getStatistics();
  }

  getTotalCost(): number {
    return this.costTracker.getTotalCost();
  }

  getCacheStats(): { size: number; hits: number; misses: number; hitRate: number } {
    return this.cacheService.stats;
  }

  private async executeWithPolicies(request: AIRequest, options: AIGenerateOptions): Promise<AIResponse> {
    const provider = this.providerRegistry.resolve(request.provider ?? 'mock');
    const retryConfig: AIRetryConfig = options.retry ?? this.options.defaultRetry ?? {
      maxRetries: 3,
      baseDelayMs: 200,
      maxDelayMs: 10000,
      backoffMultiplier: 2,
    };

    if (options.fallback) {
      const fallbackResult = await this.fallbackPolicy.executeWithFallback(
        request,
        { ...options.fallback, timeoutMs: options.fallback.timeoutMs },
        (from, to, reason) => {
          this.publishEvent('AIProviderFallback', {
            fromProvider: from,
            toProvider: to,
            fromModel: request.model,
            toModel: request.model,
            reason,
            timestamp: new Date(),
          }).catch(() => {});
        },
      );
      return fallbackResult.response;
    }

    return this.retryPolicy.executeWithRetry({
      request,
      execute: (req) => provider.generate(req),
      config: retryConfig,
    });
  }

  private mergeOptions(options?: AIGenerateOptions): AIGenerateOptions {
    return {
      provider: options?.provider ?? this.options.defaultProvider,
      model: options?.model ?? this.options.defaultModel,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      stream: options?.stream,
      retry: options?.retry ?? this.options.defaultRetry,
      fallback: options?.fallback ?? this.options.defaultFallback,
      outputValidation: options?.outputValidation,
      tools: options?.tools,
      cache: options?.cache,
      sessionId: options?.sessionId,
      metadata: { ...this.options, ...options?.metadata },
    };
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    if (!this.eventBus) return;
    try {
      await this.eventBus.publish({
        eventId: uuid(),
        eventType: `ai.${eventType}`,
        aggregateId: payload.requestId as string ?? uuid(),
        timestamp: new Date(),
        payload,
      });
    } catch {
      // Event bus errors are non-fatal
    }
  }

  health(): Record<string, unknown> {
    return {
      ok: true,
      providers: this.providerRegistry.listNames(),
      models: this.modelRegistry.size,
      sessions: this.sessionManager.size,
      cacheSize: this.cacheService.size,
      totalCost: this.costTracker.getTotalCost(),
      totalRequests: this.statisticsService.getStatistics().totalRequests,
    };
  }
}
