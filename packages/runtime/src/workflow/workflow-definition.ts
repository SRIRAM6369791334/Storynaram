import type { WorkflowStepConfig, WorkflowOptions, WorkflowDefinitionConfig } from './types.js';
import { WorkflowStepBuilder } from './workflow-builder.js';

export class WorkflowDefinition {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly steps: WorkflowStepConfig[];
  readonly options: WorkflowOptions;
  readonly metadata: Record<string, unknown>;

  constructor(config: WorkflowDefinitionConfig) {
    this.name = config.name;
    this.version = config.version;
    this.description = config.description ?? '';
    this.steps = config.steps;
    this.options = config.options ?? {};
    this.metadata = config.metadata ?? {};
    this.validate();
  }

  getStep(id: string): WorkflowStepConfig | undefined {
    return this.steps.find(s => s.id === id);
  }

  getInitialStep(): WorkflowStepConfig | undefined {
    return this.steps[0];
  }

  getNextSteps(stepId: string, transition: 'success' | 'failure' | 'skip'): WorkflowStepConfig[] {
    const step = this.getStep(stepId);
    if (!step) return [];

    let nextId: string | undefined;
    if (transition === 'success') nextId = step.nextOnSuccess;
    else if (transition === 'failure') nextId = step.nextOnFailure;
    else if (transition === 'skip') nextId = step.nextOnSkip;

    if (!nextId) return [];
    const next = this.getStep(nextId);
    return next ? [next] : [];
  }

  getAllStepIds(): string[] {
    return this.steps.map(s => s.id);
  }

  getStepCount(): number {
    return this.steps.length;
  }

  private validate(): void {
    if (!this.name) throw new Error('Workflow name is required');
    if (!this.version) throw new Error('Workflow version is required');
    if (this.steps.length === 0) throw new Error('Workflow must have at least one step');

    const ids = new Set<string>();
    for (const step of this.steps) {
      if (ids.has(step.id)) {
        throw new Error(`Duplicate step id: ${step.id}`);
      }
      ids.add(step.id);
    }

    for (const step of this.steps) {
      if (step.nextOnSuccess && !ids.has(step.nextOnSuccess)) {
        throw new Error(`Step ${step.id} references unknown nextOnSuccess: ${step.nextOnSuccess}`);
      }
      if (step.nextOnFailure && !ids.has(step.nextOnFailure)) {
        throw new Error(`Step ${step.id} references unknown nextOnFailure: ${step.nextOnFailure}`);
      }
      if (step.compensationStepId && !ids.has(step.compensationStepId)) {
        throw new Error(`Step ${step.id} references unknown compensationStepId: ${step.compensationStepId}`);
      }
    }
  }
}
