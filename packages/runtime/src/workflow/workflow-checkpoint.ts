import { Injectable, Logger } from '@nestjs/common';
import type { CheckpointData } from './types';
import { WorkflowHistoryService } from './workflow-history';
import { WorkflowContext } from './workflow-context';
import { WorkflowCheckpointError } from './errors';

@Injectable()
export class WorkflowCheckpointService {
  private readonly logger = new Logger(WorkflowCheckpointService.name);
  private readonly enabled: boolean;

  constructor(
    private readonly history: WorkflowHistoryService,
    private readonly context: WorkflowContext,
    options?: { enabled?: boolean },
  ) {
    this.enabled = options?.enabled ?? true;
  }

  async save(workflowId: string, stepId: string, contextData: Record<string, unknown>): Promise<void> {
    if (!this.enabled) return;

    try {
      const data: CheckpointData = {
        workflowId,
        stepId,
        context: contextData,
        timestamp: new Date(),
        version: '1.0',
      };
      await this.history.saveCheckpoint(data);
      this.logger.debug(`Checkpoint saved for workflow ${workflowId} at step ${stepId}`);
    } catch (error) {
      throw new WorkflowCheckpointError(workflowId, `Failed to save checkpoint: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async restore(workflowId: string): Promise<CheckpointData | null> {
    try {
      const checkpoint = await this.history.getCheckpoint(workflowId);
      if (!checkpoint) {
        this.logger.warn(`No checkpoint found for workflow ${workflowId}`);
        return null;
      }
      this.context.setAll(workflowId, checkpoint.context);
      this.logger.log(`Checkpoint restored for workflow ${workflowId} at step ${checkpoint.stepId}`);
      return checkpoint;
    } catch (error) {
      throw new WorkflowCheckpointError(workflowId, `Failed to restore checkpoint: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async hasCheckpoint(workflowId: string): Promise<boolean> {
    return this.history.hasCheckpoint(workflowId);
  }

  async clear(workflowId: string): Promise<void> {
    await this.history.deleteCheckpoint(workflowId);
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}
