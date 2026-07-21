import { DomainEvent, DomainContext } from '@storynaram/domain-kernel';
import { PlanningSession, SessionStatus } from './planning-session';
import { PlanningContext, StoryIdea } from './planning-context';
import { PlanningResult, StructuredStoryPlan } from './planning-result';
import { PlanningMemory } from './planning-memory';
import { PlanningStatistics, PlanningStats } from './planning-statistics';
import { PlanningGraph, PlanningStage } from './planning-graph';
import { PlanningPipeline, PipelineOptions, StageResult } from './pipeline/planning-pipeline';
import { BasePlannerAgent } from './agents/agent-base';
import { IdeaAgent } from './agents/idea-agent';
import { CharacterAgent } from './agents/character-agent';
import { WorldAgent } from './agents/world-agent';
import { TimelineAgent } from './agents/timeline-agent';
import { CanonAgent } from './agents/canon-agent';
import { NarrativeAgent } from './agents/narrative-agent';
import { CompositionAgent } from './agents/composition-agent';
import { ValidationAgent } from './agents/validation-agent';

export interface PlannerOptions {
  maxRetries: number;
  enableCheckpoints: boolean;
  pipelineMode: 'sequential' | 'parallel';
}

export interface PlannerHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  activeSessions: number;
  totalSessions: number;
  memoryUsage: number;
}

export class NarrativePlanner {
  private readonly memory: PlanningMemory;
  private readonly statistics: PlanningStatistics;
  private readonly agents: BasePlannerAgent[];
  private readonly graph: PlanningGraph;
  private readonly options: PlannerOptions;
  private readonly sessionTimers = new Map<string, number>();

  constructor(options?: Partial<PlannerOptions>) {
    this.memory = new PlanningMemory();
    this.statistics = new PlanningStatistics();
    this.agents = this.createDefaultAgents();
    this.graph = new PlanningGraph();
    this.options = {
      maxRetries: options?.maxRetries ?? 2,
      enableCheckpoints: options?.enableCheckpoints ?? true,
      pipelineMode: options?.pipelineMode ?? 'sequential',
    };
  }

  async createSession(idea: StoryIdea): Promise<PlanningSession> {
    const sessionId = `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const context = new PlanningContext(idea);
    const session = new PlanningSession(sessionId, context);

    this.memory.saveSession(session);
    this.memory.saveContext(sessionId, context);
    this.statistics.recordSessionStarted();

    return session;
  }

  async startPlanning(session: PlanningSession): Promise<PlanningResult> {
    session.start();
    const startTime = Date.now();
    this.sessionTimers.set(session.sessionId, startTime);

    const pipelineOptions: PipelineOptions = {
      mode: this.options.pipelineMode,
      maxRetries: this.options.maxRetries,
      enableCheckpoints: this.options.enableCheckpoints,
    };

    const pipeline = new PlanningPipeline(pipelineOptions, this.agents);
    const stageResults = await pipeline.run(session.context, session);

    const durationMs = Date.now() - startTime;
    const success = stageResults.every(r => r.success);

    if (success) {
      const result = this.buildResult(session, durationMs, stageResults);
      session.complete(result);
      this.memory.saveResult(result);
      this.statistics.recordSessionCompleted(durationMs, stageResults.length);

      for (const sr of stageResults) {
        this.statistics.recordStageTiming(sr.stage, sr.durationMs);
      }

      return result;
    }

    this.statistics.recordSessionFailed();
    throw new Error(`Planning failed: ${stageResults.filter(r => !r.success).map(r => r.errors.join('; ')).join(' || ')}`);
  }

  async plan(idea: StoryIdea): Promise<PlanningResult> {
    const session = await this.createSession(idea);
    return this.startPlanning(session);
  }

  async pauseSession(sessionId: string): Promise<void> {
    const session = this.memory.getSession(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);
    session.pause();
    this.memory.saveSession(session);
  }

  async resumeSession(sessionId: string): Promise<PlanningResult> {
    const session = this.memory.getSession(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);

    const lastCheckpoint = session.getLastCheckpoint();
    if (!lastCheckpoint) {
      return this.startPlanning(session);
    }

    session.resume();
    const startTime = Date.now();

    const pipelineOptions: PipelineOptions = {
      mode: 'sequential',
      maxRetries: this.options.maxRetries,
      enableCheckpoints: this.options.enableCheckpoints,
    };

    const pipeline = new PlanningPipeline(pipelineOptions, this.agents);
    const stageResults = await pipeline.run(session.context, session);
    const durationMs = Date.now() - startTime;

    if (stageResults.every(r => r.success)) {
      const result = this.buildResult(session, durationMs, stageResults);
      session.complete(result);
      this.memory.saveResult(result);
      return result;
    }

    throw new Error(`Resume failed: ${stageResults.filter(r => !r.success).map(r => r.errors).join('; ')}`);
  }

  async cancelSession(sessionId: string): Promise<void> {
    const session = this.memory.getSession(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);
    session.cancel();
    this.statistics.recordSessionCancelled();
    this.memory.saveSession(session);
  }

  getSession(sessionId: string): PlanningSession | undefined {
    return this.memory.getSession(sessionId);
  }

  getResult(sessionId: string): PlanningResult | undefined {
    return this.memory.getResult(sessionId);
  }

  getAllSessions(): PlanningSession[] {
    return this.memory.getAllSessions();
  }

  getAllResults(): PlanningResult[] {
    return this.memory.getAllResults();
  }

  getStatistics(): PlanningStats {
    return this.statistics.getSummary();
  }

  getStageTimings() {
    return this.statistics.getStageTimings();
  }

  getGraph(): PlanningGraph {
    return this.graph;
  }

  getMemory(): PlanningMemory {
    return this.memory;
  }

  health(): PlannerHealth {
    return {
      status: this.memory.getActiveSessionCount() > 10 ? 'degraded' : 'healthy',
      activeSessions: this.memory.getActiveSessionCount(),
      totalSessions: this.memory.getTotalSessionCount(),
      memoryUsage: this.memory.getAllSessions().length,
    };
  }

  private buildResult(session: PlanningSession, durationMs: number, stageResults: StageResult[]): PlanningResult {
    const ctx = session.context;

    const storyPlan: StructuredStoryPlan = {
      title: ctx.idea.title,
      genre: ctx.idea.genre,
      logline: ctx.idea.logline,
      premise: ctx.idea.premise,
      themes: ctx.idea.themes,
      characterCount: ctx.characterPlan ? 1 : 0,
      worldCount: ctx.worldPlan ? 1 : 0,
      timelineEvents: ctx.timelinePlan?.events.length ?? 0,
      narrativeChapters: ctx.narrativePlan?.chapters.length ?? 0,
      compositionArcs: ctx.compositionPlan?.arcs.length ?? 0,
    };

    if (!ctx.characterPlan) throw new Error('Missing character plan');
    if (!ctx.worldPlan) throw new Error('Missing world plan');
    if (!ctx.timelinePlan) throw new Error('Missing timeline plan');
    if (!ctx.narrativePlan) throw new Error('Missing narrative plan');
    if (!ctx.compositionPlan) throw new Error('Missing composition plan');
    if (!ctx.promptPackage) throw new Error('Missing prompt package');

    return new PlanningResult({
      sessionId: session.sessionId,
      storyPlan,
      characterPlan: ctx.characterPlan,
      worldPlan: ctx.worldPlan,
      timelinePlan: ctx.timelinePlan,
      narrativePlan: ctx.narrativePlan,
      compositionPlan: ctx.compositionPlan,
      promptPackage: ctx.promptPackage,
      durationMs,
      stageCount: stageResults.length,
    });
  }

  private createDefaultAgents(): BasePlannerAgent[] {
    return [
      new IdeaAgent(),
      new CharacterAgent(),
      new WorldAgent(),
      new TimelineAgent(),
      new CanonAgent(),
      new NarrativeAgent(),
      new CompositionAgent(),
      new ValidationAgent(),
    ];
  }
}
