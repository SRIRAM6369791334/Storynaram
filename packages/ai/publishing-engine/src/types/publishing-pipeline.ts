export interface PublishingPipelineStage {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;
  error?: string;
  outputSize?: number;
}

export interface PublishingPipelineState {
  stages: PublishingPipelineStage[];
  currentStageIndex: number;
  totalDurationMs: number;
  totalOutputSize: number;
}

export class PublishingPipeline {
  public state: PublishingPipelineState;

  constructor() {
    this.state = {
      stages: [],
      currentStageIndex: 0,
      totalDurationMs: 0,
      totalOutputSize: 0,
    };
  }

  addStage(name: string): void {
    this.state.stages.push({ name, status: 'pending' });
  }

  startStage(name: string): void {
    const stage = this.state.stages.find(s => s.name === name);
    if (stage) {
      stage.status = 'running';
      stage.startedAt = new Date();
    }
  }

  completeStage(name: string, outputSize?: number): void {
    const stage = this.state.stages.find(s => s.name === name);
    if (stage) {
      stage.status = 'completed';
      stage.completedAt = new Date();
      stage.durationMs = stage.startedAt ? Date.now() - stage.startedAt.getTime() : 0;
      stage.outputSize = outputSize ?? 0;
      this.state.totalDurationMs += stage.durationMs;
      this.state.totalOutputSize += stage.outputSize;
      this.state.currentStageIndex++;
    }
  }

  failStage(name: string, error: string): void {
    const stage = this.state.stages.find(s => s.name === name);
    if (stage) {
      stage.status = 'failed';
      stage.error = error;
      stage.completedAt = new Date();
    }
  }

  getStage(name: string): PublishingPipelineStage | undefined {
    return this.state.stages.find(s => s.name === name);
  }

  isComplete(): boolean {
    return this.state.stages.every(s => s.status === 'completed' || s.status === 'skipped');
  }

  hasFailed(): boolean {
    return this.state.stages.some(s => s.status === 'failed');
  }
}
