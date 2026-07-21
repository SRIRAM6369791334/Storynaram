export interface ExecutionStats {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  totalDurationMs: number;
  totalTokenUsage: TokenUsage;
  agentTimings: AgentTiming[];
  stageTimings: StageTiming[];
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface AgentTiming {
  agentId: string;
  durationMs: number;
  success: boolean;
}

export interface StageTiming {
  stage: string;
  durationMs: number;
  status: 'completed' | 'failed' | 'skipped';
}

export class ExecutionStatistics {
  private agentTimings: AgentTiming[] = [];
  private stageTimings: StageTiming[] = [];
  private tokenUsage: TokenUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  private startTime: number = 0;

  start(): void {
    this.startTime = Date.now();
  }

  recordAgentTiming(timing: AgentTiming): void {
    this.agentTimings.push(timing);
  }

  recordStageTiming(timing: StageTiming): void {
    this.stageTimings.push(timing);
  }

  recordTokenUsage(usage: TokenUsage): void {
    this.tokenUsage.inputTokens += usage.inputTokens;
    this.tokenUsage.outputTokens += usage.outputTokens;
    this.tokenUsage.totalTokens += usage.totalTokens;
  }

  getStats(totalTasks: number, completed: number, failed: number): ExecutionStats {
    return {
      totalTasks,
      completedTasks: completed,
      failedTasks: failed,
      totalDurationMs: this.startTime > 0 ? Date.now() - this.startTime : 0,
      totalTokenUsage: { ...this.tokenUsage },
      agentTimings: [...this.agentTimings],
      stageTimings: [...this.stageTimings],
    };
  }

  reset(): void {
    this.agentTimings = [];
    this.stageTimings = [];
    this.tokenUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    this.startTime = 0;
  }
}
