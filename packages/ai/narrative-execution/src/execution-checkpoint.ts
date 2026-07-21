import type { ExecutionStatus } from './execution-session';
import type { ExecutionMemorySnapshot } from './execution-memory';

export interface ExecutionCheckpoint {
  sessionId: string;
  stage: string;
  timestamp: Date;
  status: ExecutionStatus;
  completedTaskIds: string[];
  memory: ExecutionMemorySnapshot;
  metadata: Record<string, unknown>;
}

export function createCheckpoint(params: {
  sessionId: string;
  stage: string;
  status: ExecutionStatus;
  completedTaskIds: string[];
  memory: ExecutionMemorySnapshot;
  metadata?: Record<string, unknown>;
}): ExecutionCheckpoint {
  return {
    sessionId: params.sessionId,
    stage: params.stage,
    timestamp: new Date(),
    status: params.status,
    completedTaskIds: [...params.completedTaskIds],
    memory: params.memory,
    metadata: params.metadata ?? {},
  };
}
