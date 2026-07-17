import { Injectable } from '@nestjs/common';
import type { WorkflowDefinition } from './workflow-definition.type';
import { WorkflowStatus } from './workflow-status.enum';

@Injectable()
export abstract class WorkflowEnginePort {
  abstract execute(workflow: WorkflowDefinition): Promise<void>;
  abstract getStatus(workflowId: string): Promise<WorkflowStatus>;
  abstract pause(workflowId: string): Promise<void>;
  abstract resume(workflowId: string): Promise<void>;
  abstract cancel(workflowId: string): Promise<void>;
}
