import type { PlanningResult } from '@storynaram/narrative-planner';
import type { AIRuntimeService } from '@storynaram/runtime';
import { ExecutionSession, type ExecutionStatus } from './execution-session.js';
import { type ExecutionOptions } from './execution-context.js';
import { ExecutionGraph } from './execution-graph.js';
import { ExecutionScheduler, type SchedulerResult } from './execution-scheduler.js';
import type { ExecutionMemory } from './execution-memory.js';
import { createCheckpoint } from './execution-checkpoint.js';
import { ExecutionResult, type StoryDraft, type ValidationResult, type ValidationReport, type ExecutionReport, type StageReport, type CharacterProse, type WorldProse, type TimelineProse, type NarrativeProse, type CompositionProse, type ChapterDraft } from './execution-result.js';
import { CharacterExecutionAgent } from './agents/character-execution-agent.js';
import { WorldExecutionAgent } from './agents/world-execution-agent.js';
import { TimelineExecutionAgent } from './agents/timeline-execution-agent.js';
import { CanonExecutionAgent } from './agents/canon-execution-agent.js';
import { NarrativeExecutionAgent } from './agents/narrative-execution-agent.js';
import { CompositionExecutionAgent } from './agents/composition-execution-agent.js';
import { ValidationExecutionAgent } from './agents/validation-execution-agent.js';
import { MergeExecutionAgent } from './agents/merge-execution-agent.js';
import type { AgentOutput } from './agents/execution-agent.js';

export interface EngineHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  activeSessions: number;
  totalExecutions: number;
  failedExecutions: number;
}

export interface EngineOptions {
  defaultModel: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  defaultTimeout?: number;
  defaultMaxRetries?: number;
  defaultParallel?: boolean;
}

export class NarrativeExecutionEngine {
  private activeSessions: Map<string, ExecutionSession> = new Map();
  private totalExecutions: number = 0;
  private failedExecutions: number = 0;
  private readonly options: EngineOptions;

  private readonly characterAgent = new CharacterExecutionAgent();
  private readonly worldAgent = new WorldExecutionAgent();
  private readonly timelineAgent = new TimelineExecutionAgent();
  private readonly canonAgent = new CanonExecutionAgent();
  private readonly narrativeAgent = new NarrativeExecutionAgent();
  private readonly compositionAgent = new CompositionExecutionAgent();
  private readonly validationAgent = new ValidationExecutionAgent();
  private readonly mergeAgent = new MergeExecutionAgent();

  constructor(
    private readonly aiRuntime: AIRuntimeService,
    options?: Partial<EngineOptions>,
  ) {
    this.options = {
      defaultModel: options?.defaultModel ?? 'gpt-4',
      defaultTemperature: options?.defaultTemperature ?? 0.7,
      defaultMaxTokens: options?.defaultMaxTokens ?? 4000,
      defaultTimeout: options?.defaultTimeout ?? 120000,
      defaultMaxRetries: options?.defaultMaxRetries ?? 3,
      defaultParallel: options?.defaultParallel ?? true,
    };
  }

  async execute(
    result: PlanningResult,
    userOptions?: Partial<ExecutionOptions>,
    signal?: AbortSignal,
  ): Promise<ExecutionResult> {
    const sessionId = crypto.randomUUID();
    const executionOptions: ExecutionOptions = {
      model: userOptions?.model ?? this.options.defaultModel,
      temperature: userOptions?.temperature ?? this.options.defaultTemperature,
      maxTokens: userOptions?.maxTokens ?? this.options.defaultMaxTokens,
      timeout: userOptions?.timeout ?? this.options.defaultTimeout,
      maxRetries: userOptions?.maxRetries ?? this.options.defaultMaxRetries,
      parallel: userOptions?.parallel ?? this.options.defaultParallel,
    };

    const context = {
      sessionId,
      planningResult: result,
      aiRuntime: this.aiRuntime,
      abortSignal: signal,
      options: executionOptions,
    };

    const session = new ExecutionSession({ sessionId, planningResult: result, context });
    this.activeSessions.set(sessionId, session);
    this.totalExecutions++;

    try {
      session.status = 'initializing';
      session.statistics.start();
      this.createCheckpoint(session, 'initialize');

      session.status = 'building-graph';
      const graph = this.buildExecutionGraph(executionOptions);
      session.statistics.recordStageTiming({ stage: 'build-graph', durationMs: 0, status: 'completed' });
      this.createCheckpoint(session, 'build-graph', this.getCompletedIds(graph));

      session.status = 'scheduling';
      session.statistics.recordStageTiming({ stage: 'schedule', durationMs: 0, status: 'completed' });
      this.createCheckpoint(session, 'schedule', this.getCompletedIds(graph));

      session.status = 'executing';
      const scheduler = new ExecutionScheduler();
      const schedulerMode = executionOptions.parallel ? 'parallel' : 'sequential';
      const schedulerResult = await scheduler.execute(
        graph,
        context,
        session.memory,
        { mode: schedulerMode, retryDelay: 1000, maxRetryDelay: 30000 },
      );
      if (signal?.aborted) {
        throw new DOMException('Execution cancelled by signal', 'AbortError');
      }
      session.statistics.recordStageTiming({ stage: 'execute', durationMs: 0, status: 'completed' });
      this.createCheckpoint(session, 'execute', schedulerResult.completedTaskIds);

      session.status = 'merging';
      const storyDraft = this.buildStoryDraft(result, session.memory);
      session.statistics.recordStageTiming({ stage: 'merge', durationMs: 0, status: 'completed' });
      this.createCheckpoint(session, 'merge', schedulerResult.completedTaskIds);

      session.status = 'validating';
      const validationOutput = session.memory.getOutput('validation-execution');
      const validationReport = this.buildValidationReport(validationOutput);
      session.statistics.recordStageTiming({ stage: 'validate', durationMs: 0, status: 'completed' });
      this.createCheckpoint(session, 'validate', schedulerResult.completedTaskIds);

      session.status = 'completed';
      session.completedAt = new Date();
      session.statistics.recordTokenUsage(this.aggregateTokenUsage(session.memory));

      const agentTimings: Array<{ agentId: string; durationMs: number; success: boolean }> = [];
      for (const record of session.memory.getHistory()) {
        agentTimings.push({
          agentId: record.agentId,
          durationMs: record.durationMs,
          success: record.output.success,
        });
        session.statistics.recordAgentTiming({
          agentId: record.agentId,
          durationMs: record.durationMs,
          success: record.output.success,
        });
      }

      const stats = session.statistics.getStats(
        graph.totalTasks,
        schedulerResult.completedTaskIds.length,
        schedulerResult.failedTaskIds.length,
      );

      const executionResult = new ExecutionResult({
        sessionId,
        storyDraft,
        executionReport: this.buildExecutionReport(sessionId, schedulerResult, session, executionOptions.model),
        validationReport,
        statistics: stats,
      });

      this.activeSessions.delete(sessionId);
      return executionResult;
    } catch (error) {
      session.status = 'failed';
      session.error = error instanceof Error ? error.message : String(error);
      session.completedAt = new Date();
      this.failedExecutions++;
      this.activeSessions.delete(sessionId);
      throw error;
    }
  }

  private buildExecutionGraph(options: ExecutionOptions): ExecutionGraph {
    const graph = new ExecutionGraph();

    graph.addTask({
      id: 'character-execution',
      name: 'Character Execution',
      agent: this.characterAgent,
      priority: 1,
      dependencies: [],
      maxRetries: options.maxRetries ?? 3,
      timeout: options.timeout ?? 120000,
      status: 'pending',
    });

    graph.addTask({
      id: 'world-execution',
      name: 'World Execution',
      agent: this.worldAgent,
      priority: 1,
      dependencies: [],
      maxRetries: options.maxRetries ?? 3,
      timeout: options.timeout ?? 120000,
      status: 'pending',
    });

    graph.addTask({
      id: 'timeline-execution',
      name: 'Timeline Execution',
      agent: this.timelineAgent,
      priority: 1,
      dependencies: [],
      maxRetries: options.maxRetries ?? 3,
      timeout: options.timeout ?? 120000,
      status: 'pending',
    });

    graph.addTask({
      id: 'canon-execution',
      name: 'Canon Execution',
      agent: this.canonAgent,
      priority: 2,
      dependencies: ['character-execution', 'world-execution', 'timeline-execution'],
      maxRetries: options.maxRetries ?? 3,
      timeout: options.timeout ?? 120000,
      status: 'pending',
    });

    graph.addTask({
      id: 'narrative-execution',
      name: 'Narrative Execution',
      agent: this.narrativeAgent,
      priority: 2,
      dependencies: ['timeline-execution'],
      maxRetries: options.maxRetries ?? 3,
      timeout: options.timeout ?? 120000,
      status: 'pending',
    });

    graph.addTask({
      id: 'composition-execution',
      name: 'Composition Execution',
      agent: this.compositionAgent,
      priority: 3,
      dependencies: ['narrative-execution'],
      maxRetries: options.maxRetries ?? 3,
      timeout: options.timeout ?? 120000,
      status: 'pending',
    });

    graph.addTask({
      id: 'validation-execution',
      name: 'Validation Execution',
      agent: this.validationAgent,
      priority: 4,
      dependencies: ['character-execution', 'world-execution', 'timeline-execution', 'canon-execution', 'narrative-execution', 'composition-execution'],
      maxRetries: options.maxRetries ?? 3,
      timeout: options.timeout ?? 120000,
      status: 'pending',
    });

    graph.addTask({
      id: 'merge-execution',
      name: 'Merge Execution',
      agent: this.mergeAgent,
      priority: 5,
      dependencies: ['character-execution', 'world-execution', 'timeline-execution', 'canon-execution', 'narrative-execution', 'composition-execution', 'validation-execution'],
      maxRetries: options.maxRetries ?? 3,
      timeout: options.timeout ?? 180000,
      status: 'pending',
    });

    return graph;
  }

  private buildStoryDraft(result: PlanningResult, memory: ExecutionMemory): StoryDraft {
    const characterOutput = memory.getOutput('character-execution');
    const worldOutput = memory.getOutput('world-execution');
    const timelineOutput = memory.getOutput('timeline-execution');
    const narrativeOutput = memory.getOutput('narrative-execution');
    const compositionOutput = memory.getOutput('composition-execution');
    const mergeOutput = memory.getOutput('merge-execution');

    const characters: CharacterProse[] = [
      {
        name: result.characterPlan.name,
        role: result.characterPlan.role,
        introduction: characterOutput?.content ?? '',
        dialogue: '',
        scenes: [],
      },
    ];

    const worlds: WorldProse[] = [
      {
        name: result.worldPlan.name,
        regions: result.worldPlan.regions,
        description: worldOutput?.content ?? '',
      },
    ];

    const timeline: TimelineProse = {
      events: result.timelinePlan.events.map(e => ({
        date: e.date,
        title: e.title,
        narrative: '',
      })),
      overallTimeline: timelineOutput?.content ?? '',
    };

    const chapters: ChapterDraft[] = result.narrativePlan.chapters.map(ch => ({
      number: ch.number,
      title: ch.title,
      content: '',
      wordCount: 0,
    }));

    const narrative: NarrativeProse = {
      synopsis: result.narrativePlan.synopsis,
      chapters,
    };

    const composition: CompositionProse = {
      arcs: result.compositionPlan.arcs.map(a => ({
        name: a.name,
        content: '',
      })),
      overallStructure: compositionOutput?.content ?? '',
    };

    return {
      title: result.storyPlan.title,
      chapters: narrativeOutput ? this.extractChapters(narrativeOutput.content) : chapters,
      characters,
      worlds,
      timeline,
      narrative,
      composition,
      validationResults: [],
      metadata: {
        genre: result.storyPlan.genre,
        themes: result.storyPlan.themes,
        mergedContent: mergeOutput?.content ?? '',
        wordCount: mergeOutput?.content.split(/\s+/).length ?? 0,
      },
    };
  }

  private extractChapters(content: string): ChapterDraft[] {
    const chapters: ChapterDraft[] = [];
    const chapterRegex = /^#{1,3}\s+Chapter\s+(\d+)[.:]\s*(.*)$/gim;
    const matches: Array<{ num: number; title: string; nextIndex: number }> = [];
    let match: RegExpExecArray | null;

    while ((match = chapterRegex.exec(content)) !== null) {
      const num = parseInt(match[1]!, 10);
      const title = (match[2]?.trim() || `Chapter ${num}`);
      matches.push({ num, title, nextIndex: chapterRegex.lastIndex });
    }

    for (let i = 0; i < matches.length; i++) {
      const m = matches[i]!;
      const end = i < matches.length - 1 ? matches[i + 1]!.nextIndex : content.length;
      const chapterContent = content.slice(m.nextIndex, end).trim();
      const words = chapterContent.split(/\s+/).filter(Boolean).length;
      chapters.push({
        number: m.num,
        title: m.title,
        content: chapterContent,
        wordCount: words,
      });
    }

    if (chapters.length === 0) {
      chapters.push({
        number: 1,
        title: 'Chapter 1',
        content,
        wordCount: content.split(/\s+/).filter(Boolean).length,
      });
    }

    return chapters;
  }

  private buildValidationReport(validationOutput?: AgentOutput): ValidationReport {
    if (validationOutput === undefined) {
      return {
        passed: false,
        validations: [],
        summary: 'No validation was performed.',
      };
    }

    const metadata = validationOutput.metadata as { validationResults?: ValidationResult[]; passed?: boolean } | undefined;
    const validations = metadata?.validationResults ?? [];
    const passed = metadata?.passed ?? validations.every(v => v.passed);

    return {
      passed,
      validations,
      summary: passed
        ? 'All consistency checks passed.'
        : `${validations.filter(v => !v.passed).length} consistency checks failed.`,
    };
  }

  private buildExecutionReport(
    sessionId: string,
    schedulerResult: SchedulerResult,
    session: ExecutionSession,
    model: string,
  ): ExecutionReport {
    const stages: StageReport[] = [];

    for (const [taskId, output] of schedulerResult.taskResults) {
      stages.push({
        name: taskId,
        status: 'completed',
        durationMs: output.latencyMs,
        agentId: output.agentId,
        tokenUsage: output.tokenUsage,
      });
    }

    for (const taskId of schedulerResult.failedTaskIds) {
      stages.push({
        name: taskId,
        status: 'failed',
        durationMs: 0,
        agentId: taskId,
        error: `Task ${taskId} failed after retries`,
      });
    }

    return {
      sessionId,
      status: session.status,
      stages,
      totalDurationMs: schedulerResult.totalDurationMs,
      totalTokens: schedulerResult.completedTaskIds.length > 0
        ? Array.from(schedulerResult.taskResults.values()).reduce((sum, o) => sum + o.tokenUsage.totalTokens, 0)
        : 0,
      model,
    };
  }

  private aggregateTokenUsage(memory: ExecutionMemory): { inputTokens: number; outputTokens: number; totalTokens: number } {
    let input = 0;
    let output = 0;
    let total = 0;

    for (const record of memory.getHistory()) {
      input += record.output.tokenUsage.inputTokens;
      output += record.output.tokenUsage.outputTokens;
      total += record.output.tokenUsage.totalTokens;
    }

    return { inputTokens: input, outputTokens: output, totalTokens: total };
  }

  private getCompletedIds(graph: ExecutionGraph): string[] {
    return Array.from(graph.tasks.values())
      .filter(t => t.status === 'completed')
      .map(t => t.id);
  }

  private createCheckpoint(session: ExecutionSession, stage: string, completedTaskIds?: string[]): void {
    const checkpoint = createCheckpoint({
      sessionId: session.sessionId,
      stage,
      status: session.status,
      completedTaskIds: completedTaskIds ?? [],
      memory: session.memory.snapshot(),
      metadata: { completedTaskIds: completedTaskIds ?? [] },
    });
    session.addCheckpoint(checkpoint);
  }

  getHealth(): EngineHealth {
    return {
      status: this.failedExecutions > this.totalExecutions * 0.5 ? 'degraded' : 'healthy',
      activeSessions: this.activeSessions.size,
      totalExecutions: this.totalExecutions,
      failedExecutions: this.failedExecutions,
    };
  }

  getSession(sessionId: string): ExecutionSession | undefined {
    return this.activeSessions.get(sessionId);
  }
}
