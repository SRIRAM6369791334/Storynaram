export interface RevisionPipelineStage {
  name: string;
  passType: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;
  issuesFound: number;
  issuesResolved: number;
  error?: string;
}

export interface RevisionPipelineState {
  stages: RevisionPipelineStage[];
  currentPassIndex: number;
  totalIssuesFound: number;
  totalIssuesResolved: number;
  totalDurationMs: number;
}

export class RevisionPipeline {
  public state: RevisionPipelineState;

  constructor() {
    this.state = {
      stages: [],
      currentPassIndex: 0,
      totalIssuesFound: 0,
      totalIssuesResolved: 0,
      totalDurationMs: 0,
    };
  }

  addStage(name: string, passType: string): void {
    this.state.stages.push({
      name,
      passType,
      status: 'pending',
      issuesFound: 0,
      issuesResolved: 0,
    });
  }

  startStage(name: string): void {
    const stage = this.state.stages.find(s => s.name === name);
    if (stage) {
      stage.status = 'running';
      stage.startedAt = new Date();
    }
  }

  completeStage(name: string, issuesFound: number, issuesResolved: number): void {
    const stage = this.state.stages.find(s => s.name === name);
    if (stage) {
      stage.status = 'completed';
      stage.completedAt = new Date();
      stage.durationMs = stage.startedAt ? Date.now() - stage.startedAt.getTime() : 0;
      stage.issuesFound = issuesFound;
      stage.issuesResolved = issuesResolved;
      this.state.totalIssuesFound += issuesFound;
      this.state.totalIssuesResolved += issuesResolved;
      if (stage.durationMs) this.state.totalDurationMs += stage.durationMs;
      this.state.currentPassIndex++;
    }
  }

  failStage(name: string, error: string): void {
    const stage = this.state.stages.find(s => s.name === name);
    if (stage) {
      stage.status = 'failed';
      stage.error = error;
      stage.completedAt = new Date();
      stage.durationMs = stage.startedAt ? Date.now() - stage.startedAt.getTime() : 0;
    }
  }

  getStage(name: string): RevisionPipelineStage | undefined {
    return this.state.stages.find(s => s.name === name);
  }

  isComplete(): boolean {
    return this.state.stages.every(s => s.status === 'completed' || s.status === 'skipped');
  }

  hasFailed(): boolean {
    return this.state.stages.some(s => s.status === 'failed');
  }
}
