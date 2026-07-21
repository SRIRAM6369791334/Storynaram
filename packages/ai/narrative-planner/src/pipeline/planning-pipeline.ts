import { BasePlannerAgent, AgentResult } from '../agents/agent-base';
import { PlanningContext } from '../planning-context';
import { PlanningSession, SessionStatus } from '../planning-session';
import { PlanningGraph, PlanningStage } from '../planning-graph';

export type PipelineMode = 'sequential' | 'parallel';

export interface PipelineOptions {
  mode: PipelineMode;
  maxRetries: number;
  enableCheckpoints: boolean;
  signal?: AbortSignal;
}

export interface StageResult {
  stage: string;
  agentName: string;
  success: boolean;
  errors: string[];
  warnings: string[];
  durationMs: number;
  retries: number;
}

export class PlanningPipeline {
  private readonly graph: PlanningGraph;
  private readonly agents: Map<PlanningStage, BasePlannerAgent>;
  private aborted = false;

  constructor(
    private readonly options: PipelineOptions,
    agents: BasePlannerAgent[],
  ) {
    this.graph = new PlanningGraph();
    this.agents = new Map();
    for (const agent of agents) {
      this.agents.set(agent.stage as PlanningStage, agent);
    }
  }

  onAbort(): void {
    this.aborted = true;
  }

  getGraph(): PlanningGraph {
    return this.graph;
  }

  async run(context: PlanningContext, session: PlanningSession): Promise<StageResult[]> {
    if (this.options.mode === 'parallel') {
      return this.runParallel(context, session);
    }
    return this.runSequential(context, session);
  }

  private async runSequential(context: PlanningContext, session: PlanningSession): Promise<StageResult[]> {
    const order = this.graph.getTopologicalOrder();
    const results: StageResult[] = [];

    for (const stage of order) {
      if (this.aborted || session.status === 'cancelled') break;

      const result = await this.executeStage(stage, context, session);
      results.push(result);

      if (!result.success && (session.status as SessionStatus) !== 'cancelled') {
        session.fail(`Stage ${stage} failed: ${result.errors.join('; ')}`);
        break;
      }
    }

    return results;
  }

  private async runParallel(context: PlanningContext, session: PlanningSession): Promise<StageResult[]> {
    const groups = this.graph.getParallelGroups();
    const results: StageResult[] = [];

    for (const group of groups) {
      if (this.aborted || session.status === 'cancelled') break;

      const stageResults = await Promise.all(
        group.map(stage => this.executeStage(stage, context, session)),
      );

      results.push(...stageResults);

      const failed = stageResults.find(r => !r.success);
      if (failed) {
        session.fail(`Stage ${failed.stage} failed: ${failed.errors.join('; ')}`);
        break;
      }
    }

    return results;
  }

  private async executeStage(
    stage: PlanningStage,
    context: PlanningContext,
    session: PlanningSession,
  ): Promise<StageResult> {
    const agent = this.agents.get(stage);
    if (!agent) {
      return {
        stage, agentName: 'skipped', success: true,
        errors: [], warnings: [`No agent registered for stage: ${stage}`],
        durationMs: 0, retries: 0,
      };
    }

    session.setStage(stage);

    if (this.options.enableCheckpoints) {
      session.createCheckpoint(stage);
    }

    const startTime = Date.now();
    let lastError: string[] = [];
    let retries = 0;

    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      if (this.aborted) {
        return {
          stage, agentName: agent.name, success: false,
          errors: ['Pipeline aborted'], warnings: [],
          durationMs: Date.now() - startTime, retries,
        };
      }

      try {
        const agentResult: AgentResult = await agent.execute(context, session);
        const durationMs = Date.now() - startTime;

        if (agentResult.success) {
          return {
            stage, agentName: agent.name, success: true,
            errors: [], warnings: agentResult.warnings,
            durationMs, retries,
          };
        }

        lastError = agentResult.errors;
      } catch (err) {
        lastError = [err instanceof Error ? err.message : String(err)];
      }

      retries++;
    }

    return {
      stage, agentName: agent.name, success: false,
      errors: lastError, warnings: [],
      durationMs: Date.now() - startTime, retries,
    };
  }
}
