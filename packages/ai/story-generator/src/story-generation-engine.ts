import { Injectable } from '@nestjs/common';
import type { ExecutionResult, StoryDraft, ChapterDraft } from '@storynaram/narrative-execution';
import { AIRuntimeService } from '@storynaram/runtime';
import { GenerationSession, type GenerationStatus } from './generation-session';
import type { GenerationOptions } from './generation-context';
import { GenerationPipeline } from './generation-pipeline';
import { GenerationResult, type GeneratedChapter, type QualityCheck } from './generation-result';
import { PromptAssembler } from './prompt/prompt-assembler';
import { PromptOptimizer } from './prompt/prompt-optimizer';
import { ContextBuilder } from './prompt/context-builder';
import { OutputAssembler } from './output/output-assembler';
import { StreamingCoordinator } from './output/streaming-coordinator';
import { TokenBudgetManager } from './selection/token-budget-manager';
import { ModelSelector } from './selection/model-selector';
import { ProviderSelector } from './selection/provider-selector';

export interface EngineHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  activeSessions: number;
  totalGenerations: number;
  failedGenerations: number;
}

export interface EngineOptions {
  defaultModel: string;
  defaultProvider?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  defaultTopP?: number;
  defaultStream?: boolean;
  defaultRetryCount?: number;
  generateSequentially?: boolean;
  includePreviousContext?: boolean;
  maxConcurrentChapters?: number;
}

@Injectable()
export class StoryGenerationEngine {
  private activeSessions: Map<string, GenerationSession> = new Map();
  private totalGenerations: number = 0;
  private failedGenerations: number = 0;
  private readonly options: EngineOptions;

  private readonly promptAssembler = new PromptAssembler();
  private readonly promptOptimizer = new PromptOptimizer();
  private readonly contextBuilder = new ContextBuilder();
  private readonly outputAssembler = new OutputAssembler();
  private readonly streamingCoordinator = new StreamingCoordinator();
  private readonly tokenBudgetManager = new TokenBudgetManager();
  private readonly modelSelector = new ModelSelector();
  private readonly providerSelector = new ProviderSelector();

  constructor(
    private readonly aiRuntime: AIRuntimeService,
    options?: Partial<EngineOptions>,
  ) {
    this.options = {
      defaultModel: options?.defaultModel ?? 'gpt-4-turbo',
      defaultProvider: options?.defaultProvider,
      defaultTemperature: options?.defaultTemperature ?? 0.8,
      defaultMaxTokens: options?.defaultMaxTokens ?? 4000,
      defaultTopP: options?.defaultTopP ?? 0.9,
      defaultStream: options?.defaultStream ?? false,
      defaultRetryCount: options?.defaultRetryCount ?? 2,
      generateSequentially: options?.generateSequentially ?? true,
      includePreviousContext: options?.includePreviousContext ?? true,
      maxConcurrentChapters: options?.maxConcurrentChapters ?? 1,
    };
  }

  async generate(
    executionResult: ExecutionResult,
    userOptions?: Partial<GenerationOptions>,
    signal?: AbortSignal,
  ): Promise<GenerationResult> {
    const sessionId = crypto.randomUUID();
    const options: GenerationOptions = {
      model: userOptions?.model ?? this.options.defaultModel,
      provider: userOptions?.provider ?? this.options.defaultProvider,
      temperature: userOptions?.temperature ?? this.options.defaultTemperature,
      maxTokens: userOptions?.maxTokens ?? this.options.defaultMaxTokens,
      topP: userOptions?.topP ?? this.options.defaultTopP,
      stop: userOptions?.stop,
      stream: userOptions?.stream ?? this.options.defaultStream,
      retryCount: userOptions?.retryCount ?? this.options.defaultRetryCount,
      fallbackModels: userOptions?.fallbackModels,
      fallbackProviders: userOptions?.fallbackProviders,
    };

    const context = {
      sessionId,
      executionResult,
      aiRuntime: this.aiRuntime,
      abortSignal: signal,
      options,
    };

    const session = new GenerationSession({ sessionId, executionResult, context });
    this.activeSessions.set(sessionId, session);
    this.totalGenerations++;

    const pipeline = new GenerationPipeline();
    pipeline.addStage('build-context');
    pipeline.addStage('assemble-prompts');
    pipeline.addStage('generate');
    pipeline.addStage('assemble');
    pipeline.addStage('validate');

    try {
      session.status = 'building-context';
      session.statistics.start();
      pipeline.startStage('build-context');
      const modelSelection = this.modelSelector.selectForStoryGeneration(options.model);
      const providerConfig = this.providerSelector.selectProvider(modelSelection.model, options.provider);
      const budget = this.tokenBudgetManager.calculateBudget(executionResult.storyDraft.chapters.length);
      pipeline.completeStage('build-context');
      session.memory.setShared('model', modelSelection.model);
      session.memory.setShared('provider', providerConfig.name);

      session.status = 'assembling-prompts';
      pipeline.startStage('assemble-prompts');
      pipeline.completeStage('assemble-prompts');

      session.status = 'generating';
      pipeline.startStage('generate');
      const chapters = await this.generateChapters(executionResult, context, modelSelection.model, providerConfig.name, budget, pipeline, signal);
      pipeline.completeStage('generate');

      session.status = 'assembling';
      pipeline.startStage('assemble');
      const fullStory = this.outputAssembler.assembleFullStory(chapters);
      pipeline.completeStage('assemble');

      session.status = 'validating';
      pipeline.startStage('validate');
      const qualityChecks = this.runQualityChecks(chapters, executionResult.storyDraft);
      const qualityReport = {
        passed: qualityChecks.every(c => c.passed),
        checks: qualityChecks,
      };
      pipeline.completeStage('validate');

      session.status = 'completed';
      session.completedAt = new Date();

      const metrics = {
        totalDurationMs: pipeline.state.totalDurationMs,
        totalTokens: pipeline.state.totalTokens.totalTokens,
        totalCost: this.calculateTotalCost(chapters),
        chaptersGenerated: chapters.length,
        averageLatencyMs: chapters.length > 0 ? chapters.reduce((a, c) => a + c.latencyMs, 0) / chapters.length : 0,
        modelsUsed: [...new Set(chapters.map(c => c.model))],
        providersUsed: [...new Set(chapters.map(c => c.provider))],
        streamingEnabled: options.stream ?? false,
        retryCount: this.totalGenerations > 0 ? Math.floor(this.failedGenerations / this.totalGenerations * 100) : 0,
      };

      const generationResult = new GenerationResult({
        sessionId,
        storyTitle: executionResult.storyDraft.title,
        chapters,
        fullStory,
        qualityReport,
        metrics,
      });

      this.activeSessions.delete(sessionId);
      return generationResult;
    } catch (error) {
      session.status = 'failed';
      session.error = error instanceof Error ? error.message : String(error);
      session.completedAt = new Date();
      this.failedGenerations++;
      this.activeSessions.delete(sessionId);
      throw error;
    }
  }

  private async generateChapters(
    executionResult: ExecutionResult,
    context: { sessionId: string; executionResult: ExecutionResult; aiRuntime: AIRuntimeService; abortSignal?: AbortSignal; options: GenerationOptions },
    model: string,
    provider: string,
    budget: { totalBudget: number; perChapter: number; remaining: number; reservedForSystem: number },
    pipeline: GenerationPipeline,
    signal?: AbortSignal,
  ): Promise<GeneratedChapter[]> {
    const chapters: GeneratedChapter[] = [];
    const draft = executionResult.storyDraft;

    if (this.options.generateSequentially) {
      for (const chapter of draft.chapters) {
        if (signal?.aborted) throw new DOMException('Generation cancelled', 'AbortError');
        const generated = await this.generateSingleChapter(draft, chapter, context, model, provider, budget, chapters);
        chapters.push(generated);
        pipeline.addChapter({
          chapterNumber: generated.number,
          chapterTitle: generated.title,
          prompt: '',
          optimizedPrompt: '',
          selectedModel: generated.model,
          selectedProvider: generated.provider,
          generatedContent: generated.content,
          tokenUsage: generated.tokenUsage,
          latencyMs: generated.latencyMs,
        });
      }
    } else {
      const chunks: ChapterDraft[][] = [];
      const concurrency = this.options.maxConcurrentChapters ?? 1;
      for (let i = 0; i < draft.chapters.length; i += concurrency) {
        chunks.push(draft.chapters.slice(i, i + concurrency));
      }
      for (const chunk of chunks) {
        if (signal?.aborted) throw new DOMException('Generation cancelled', 'AbortError');
        const batch = await Promise.all(
          chunk.map(ch => this.generateSingleChapter(draft, ch, context, model, provider, budget, chapters)),
        );
        for (const generated of batch) {
          chapters.push(generated);
          pipeline.addChapter({
            chapterNumber: generated.number,
            chapterTitle: generated.title,
            prompt: '',
            optimizedPrompt: '',
            selectedModel: generated.model,
            selectedProvider: generated.provider,
            generatedContent: generated.content,
            tokenUsage: generated.tokenUsage,
            latencyMs: generated.latencyMs,
          });
        }
      }
    }

    return chapters;
  }

  private async generateSingleChapter(
    draft: StoryDraft,
    chapter: ChapterDraft,
    context: { sessionId: string; executionResult: ExecutionResult; aiRuntime: AIRuntimeService; abortSignal?: AbortSignal; options: GenerationOptions },
    model: string,
    provider: string,
    budget: { totalBudget: number; perChapter: number; remaining: number; reservedForSystem: number },
    previousChapters: GeneratedChapter[],
  ): Promise<GeneratedChapter> {
    const previousContent = this.options.includePreviousContext
      ? previousChapters.map(c => c.content).slice(-1).join('\n\n')
      : '';

    const assembledPrompt = this.promptAssembler.assembleChapterPrompt(draft, chapter, previousContent);

    const allocation = this.tokenBudgetManager.allocateForChapter(budget, assembledPrompt.estimatedTokens);

    const optimized = this.promptOptimizer.optimize(assembledPrompt, allocation.promptTokens);

    let lastError: Error | undefined;
    let lastContent = '';

    const maxRetries = context.options.retryCount ?? 2;
    const models = [model, ...(context.options.fallbackModels ?? [])];

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const currentModel = attempt > 0 && models.length > attempt ? models[attempt]! : model;
        const currentProvider = attempt > 0 ? this.providerSelector.selectProvider(currentModel).name : provider;

        if (context.options.stream) {
          const result = await this.streamingCoordinator.streamChapter(
            context.aiRuntime,
            {
              model: currentModel,
              messages: [
                { role: 'system', content: optimized.systemPrompt },
                { role: 'user', content: optimized.userPrompt },
              ],
              temperature: context.options.temperature,
              maxTokens: allocation.maxOutputTokens,
              topP: context.options.topP,
              stop: context.options.stop,
            },
            chapter.number,
            { signal: context.abortSignal },
          );
          lastContent = result.content;
        } else {
          const startTime = Date.now();
          const response = await context.aiRuntime.generate(
            {
              model: currentModel,
              messages: [
                { role: 'system', content: optimized.systemPrompt },
                { role: 'user', content: optimized.userPrompt },
              ],
              temperature: context.options.temperature,
              maxTokens: allocation.maxOutputTokens,
              topP: context.options.topP,
              stop: context.options.stop,
            },
            { sessionId: context.sessionId },
          );

          lastContent = response.messages[response.messages.length - 1]?.content ?? '';
          const latencyMs = Date.now() - startTime;

          const generated: GeneratedChapter = {
            number: chapter.number,
            title: chapter.title,
            content: lastContent,
            wordCount: this.outputAssembler.calculateWordCount(lastContent),
            model: currentModel,
            provider: currentProvider,
            latencyMs,
            tokenUsage: response.tokenUsage,
          };

          this.sessionStatTrack(chapter.number, latencyMs, response.tokenUsage, currentModel, currentProvider);
          return generated;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (signalAborted(context.abortSignal)) {
          throw new DOMException('Generation cancelled', 'AbortError');
        }
        if (attempt < maxRetries) {
          await delay(Math.min(1000 * Math.pow(2, attempt), 10000));
        }
      }
    }

    if (lastContent) {
      return {
        number: chapter.number,
        title: chapter.title,
        content: lastContent,
        wordCount: this.outputAssembler.calculateWordCount(lastContent),
        model,
        provider,
        latencyMs: 0,
        tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      };
    }

    throw lastError ?? new Error(`Failed to generate chapter ${chapter.number}`);
  }

  private sessionStatTrack(chapterNumber: number, latencyMs: number, tokenUsage: { inputTokens: number; outputTokens: number; totalTokens: number }, model: string, provider: string): void {
    const { inputTokens, outputTokens, totalTokens } = tokenUsage;
    for (const [, session] of this.activeSessions) {
      session.statistics.recordChapterGeneration(latencyMs, { input: inputTokens, output: outputTokens, total: totalTokens }, model, provider);
    }
  }

  private runQualityChecks(chapters: GeneratedChapter[], draft: StoryDraft): QualityCheck[] {
    const checks: QualityCheck[] = [];

    const chapterCountCheck = this.checkChapterCount(chapters, draft.chapters.length);
    checks.push(chapterCountCheck);

    if (chapters.length > 0) {
      const wordCountCheck = this.checkWordCount(chapters);
      checks.push(wordCountCheck);

      const contentCheck = this.checkContentQuality(chapters);
      checks.push(contentCheck);
    }

    return checks;
  }

  private checkChapterCount(chapters: GeneratedChapter[], expected: number): QualityCheck {
    const passed = chapters.length === expected;
    return {
      name: 'ChapterCount',
      passed,
      score: passed ? 100 : Math.round((chapters.length / expected) * 100),
      issues: passed ? [] : [`Generated ${chapters.length} of ${expected} chapters`],
    };
  }

  private checkWordCount(chapters: GeneratedChapter[]): QualityCheck {
    const totalWords = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
    const avgWords = totalWords / chapters.length;
    const passed = avgWords >= 100;
    return {
      name: 'WordCount',
      passed,
      score: Math.min(100, Math.round((avgWords / 500) * 100)),
      issues: avgWords < 100 ? [`Average word count per chapter: ${Math.round(avgWords)}`] : [],
    };
  }

  private checkContentQuality(chapters: GeneratedChapter[]): QualityCheck {
    let totalIssues = 0;
    const issues: string[] = [];

    for (const ch of chapters) {
      if (!ch.content || ch.content.length < 50) {
        totalIssues++;
        issues.push(`Chapter ${ch.number} has insufficient content`);
      }
    }

    const passed = totalIssues === 0;
    return {
      name: 'ContentQuality',
      passed,
      score: passed ? 100 : Math.max(0, 100 - totalIssues * 20),
      issues,
    };
  }

  private calculateTotalCost(chapters: GeneratedChapter[]): number {
    let totalCost = 0;
    for (const ch of chapters) {
      const inputTokens = ch.tokenUsage.inputTokens;
      const outputTokens = ch.tokenUsage.outputTokens;
      const rates: Record<string, { input: number; output: number }> = {
        'gpt-4': { input: 0.03, output: 0.06 },
        'gpt-4-turbo': { input: 0.01, output: 0.03 },
      };
      const rate = rates[ch.model] ?? { input: 0.01, output: 0.03 };
      totalCost += (inputTokens / 1000) * rate.input + (outputTokens / 1000) * rate.output;
    }
    return Math.round(totalCost * 100000) / 100000;
  }

  getHealth(): EngineHealth {
    return {
      status: this.failedGenerations > this.totalGenerations * 0.5 ? 'degraded' : 'healthy',
      activeSessions: this.activeSessions.size,
      totalGenerations: this.totalGenerations,
      failedGenerations: this.failedGenerations,
    };
  }

  getSession(sessionId: string): GenerationSession | undefined {
    return this.activeSessions.get(sessionId);
  }
}

function signalAborted(signal?: AbortSignal): boolean {
  return signal?.aborted ?? false;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
