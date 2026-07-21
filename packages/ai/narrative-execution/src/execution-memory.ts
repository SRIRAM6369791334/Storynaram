import type { AgentOutput } from './agents/execution-agent';

export interface ExecutionRecord {
  agentId: string;
  stage: string;
  output: AgentOutput;
  timestamp: Date;
  durationMs: number;
}

export interface RetryState {
  agentId: string;
  attempt: number;
  maxRetries: number;
  lastError?: string;
  nextRetryAt?: Date;
}

export class ExecutionMemory {
  private history: ExecutionRecord[] = [];
  private intermediateOutputs: Map<string, AgentOutput> = new Map();
  private sharedContext: Map<string, unknown> = new Map();
  private retryStates: Map<string, RetryState> = new Map();

  record(record: ExecutionRecord): void {
    this.history.push(record);
    this.intermediateOutputs.set(record.agentId, record.output);
  }

  getOutput(agentId: string): AgentOutput | undefined {
    return this.intermediateOutputs.get(agentId);
  }

  getAllOutputs(): AgentOutput[] {
    return Array.from(this.intermediateOutputs.values());
  }

  getSuccessfulOutputs(): AgentOutput[] {
    return Array.from(this.intermediateOutputs.values()).filter(o => o.success);
  }

  getHistory(): ExecutionRecord[] {
    return [...this.history];
  }

  setShared(key: string, value: unknown): void {
    this.sharedContext.set(key, value);
  }

  getShared<T = unknown>(key: string): T | undefined {
    return this.sharedContext.get(key) as T | undefined;
  }

  setRetryState(agentId: string, state: RetryState): void {
    this.retryStates.set(agentId, state);
  }

  getRetryState(agentId: string): RetryState | undefined {
    return this.retryStates.get(agentId);
  }

  clearRetryState(agentId: string): void {
    this.retryStates.delete(agentId);
  }

  snapshot(): ExecutionMemorySnapshot {
    return {
      history: [...this.history],
      intermediateOutputs: new Map(this.intermediateOutputs),
      sharedContext: new Map(this.sharedContext),
      retryStates: new Map(this.retryStates),
    };
  }

  restore(snapshot: ExecutionMemorySnapshot): void {
    this.history = [...snapshot.history];
    this.intermediateOutputs = new Map(snapshot.intermediateOutputs);
    this.sharedContext = new Map(snapshot.sharedContext);
    this.retryStates = new Map(snapshot.retryStates);
  }
}

export interface ExecutionMemorySnapshot {
  history: ExecutionRecord[];
  intermediateOutputs: Map<string, AgentOutput>;
  sharedContext: Map<string, unknown>;
  retryStates: Map<string, RetryState>;
}
