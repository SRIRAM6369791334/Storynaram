import type { StepType, WorkflowStepConfig, RetryPolicy, TimeoutPolicy, RollbackPolicy, WorkflowOptions } from './types';
import { WorkflowDefinition } from './workflow-definition';

export class WorkflowBuilder {
  private name = '';
  private version = '1.0.0';
  private description = '';
  private steps: WorkflowStepConfig[] = [];
  private options: WorkflowOptions = {};
  private metadata: Record<string, unknown> = {};

  static create(name: string): WorkflowBuilder {
    const builder = new WorkflowBuilder();
    builder.name = name;
    return builder;
  }

  withVersion(version: string): this {
    this.version = version;
    return this;
  }

  withDescription(description: string): this {
    this.description = description;
    return this;
  }

  withOptions(options: WorkflowOptions): this {
    this.options = { ...this.options, ...options };
    return this;
  }

  withMetadata(metadata: Record<string, unknown>): this {
    this.metadata = { ...this.metadata, ...metadata };
    return this;
  }

  addStep(id: string, type: StepType): WorkflowStepBuilder {
    const stepBuilder = new WorkflowStepBuilder(this, id, type);
    return stepBuilder;
  }

  build(): WorkflowDefinition {
    if (this.steps.length === 0) {
      throw new Error('Cannot build workflow with no steps');
    }
    return new WorkflowDefinition({
      name: this.name,
      version: this.version,
      description: this.description,
      steps: this.steps,
      options: this.options,
      metadata: this.metadata,
    });
  }

  addStepConfig(config: WorkflowStepConfig): void {
    this.steps.push(config);
  }
}

export class WorkflowStepBuilder {
  private config: Partial<WorkflowStepConfig>;

  constructor(
    private readonly parent: WorkflowBuilder,
    id: string,
    type: StepType,
  ) {
    this.config = { id, type, config: {} };
  }

  withLabel(label: string): this {
    this.config.label = label;
    return this;
  }

  withDescription(description: string): this {
    this.config.description = description;
    return this;
  }

  withConfig(config: Record<string, unknown>): this {
    this.config.config = { ...this.config.config, ...config };
    return this;
  }

  onSuccess(stepId: string): this {
    this.config.nextOnSuccess = stepId;
    return this;
  }

  onFailure(stepId: string): this {
    this.config.nextOnFailure = stepId;
    return this;
  }

  onSkip(stepId: string): this {
    this.config.nextOnSkip = stepId;
    return this;
  }

  withRetry(policy: RetryPolicy): this {
    this.config.retry = policy;
    return this;
  }

  withTimeout(policy: TimeoutPolicy): this {
    this.config.timeout = policy;
    return this;
  }

  withRollback(policy: RollbackPolicy): this {
    this.config.rollback = policy;
    return this;
  }

  compensationStep(stepId: string): this {
    this.config.compensationStepId = stepId;
    return this;
  }

  withInputMapping(mapping: Record<string, string>): this {
    this.config.inputMapping = mapping;
    return this;
  }

  withOutputMapping(mapping: Record<string, string>): this {
    this.config.outputMapping = mapping;
    return this;
  }

  withCondition(condition: string): this {
    this.config.condition = condition;
    return this;
  }

  withChildren(children: WorkflowStepConfig[]): this {
    this.config.children = children;
    return this;
  }

  end(): WorkflowBuilder {
    this.parent.addStepConfig(this.config as WorkflowStepConfig);
    return this.parent;
  }
}
