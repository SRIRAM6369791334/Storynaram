import { Injectable, Logger } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import type { ValidationEngineService } from '@storynaram/validation';
import { RepositoryManager } from '../repository/repository-manager.js';
import { RelationshipService } from '../relationship/relationship-service.js';
import type { StepType, WorkflowStepConfig, StepResult, TransitionType, RetryPolicy } from './types.js';
import { WorkflowExecutionError } from './errors.js';

export interface StepHandler {
  type: StepType;
  execute(
    step: WorkflowStepConfig,
    context: Record<string, unknown>,
  ): Promise<{ output: Record<string, unknown>; transition: TransitionType }>;
}

@Injectable()
export class WorkflowStepExecutor {
  private readonly logger = new Logger(WorkflowStepExecutor.name);

  constructor(
    private readonly validationEngine?: ValidationEngineService,
    private readonly repositoryManager?: RepositoryManager,
    private readonly relationshipService?: RelationshipService,
  ) {}

  async executeStep(
    step: WorkflowStepConfig,
    context: Record<string, unknown>,
    retryPolicy?: RetryPolicy,
  ): Promise<StepResult> {
    const startTime = Date.now();
    let lastError: string | null = null;
    let attempt = 0;
    const effectiveRetry = retryPolicy ?? step.retry;
    const maxAttempts = (effectiveRetry?.maxRetries ?? 0) + 1;

    while (attempt < maxAttempts) {
      try {
        const result = await this.executeStepInternal(step, context);
        const durationMs = Date.now() - startTime;
        return {
          stepId: step.id,
          success: true,
          output: result.output,
          error: null,
          durationMs,
          transition: result.transition,
          retryAttempt: attempt,
        };
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        attempt++;
        this.logger.warn(`Step ${step.id} attempt ${String(attempt)}/${String(maxAttempts)} failed: ${lastError}`);

        if (attempt < maxAttempts) {
          const delay = this.calculateRetryDelay(effectiveRetry, attempt);
          await this.sleep(delay);
        }
      }
    }

    const durationMs = Date.now() - startTime;
    return {
      stepId: step.id,
      success: false,
      output: {},
      error: lastError,
      durationMs,
      transition: 'failure',
      retryAttempt: attempt - 1,
    };
  }

  private async executeStepInternal(
    step: WorkflowStepConfig,
    context: Record<string, unknown>,
  ): Promise<{ output: Record<string, unknown>; transition: TransitionType }> {
    switch (step.type) {
      case 'Validation':
        return this.executeValidation(step, context);
      case 'Repository':
        return this.executeRepository(step, context);
      case 'Relationship':
        return this.executeRelationship(step, context);
      case 'Delay':
        return this.executeDelay(step);
      case 'Custom':
        return this.executeCustom(step, context);
      default:
        return {
          output: { result: `Step ${step.id} of type ${step.type} executed` },
          transition: 'success',
        };
    }
  }

  private async executeValidation(
    step: WorkflowStepConfig,
    context: Record<string, unknown>,
  ): Promise<{ output: Record<string, unknown>; transition: TransitionType }> {
    if (!this.validationEngine) {
      return { output: { validated: true }, transition: 'success' };
    }

    const schemaId = step.config.schemaId as string | undefined;
    const dataKey = step.config.dataKey as string | undefined;
    const data = dataKey ? (context[dataKey] as Record<string, unknown>) : context;

    if (!schemaId) {
      return { output: { validated: true, skipped: true }, transition: 'success' };
    }

    try {
      const result = await this.validationEngine.validate(data, schemaId);
      return {
        output: {
          validated: true,
          valid: result.passed,
          issues: result.issues,
          score: result.score,
        },
        transition: 'success',
      };
    } catch (error) {
      this.logger.error(`Validation failed for ${schemaId}`, error);
      return {
        output: { validated: false },
        transition: 'failure',
      };
    }
  }

  private async executeRepository(
    step: WorkflowStepConfig,
    context: Record<string, unknown>,
  ): Promise<{ output: Record<string, unknown>; transition: TransitionType }> {
    if (!this.repositoryManager) {
      return { output: { result: 'No repository manager available' }, transition: 'success' };
    }

    const operation = step.config.operation as string | undefined;
    const entityType = step.config.entityType as string | undefined;

    if (!entityType || !operation) {
      return { output: { result: 'Missing required config' }, transition: 'failure' };
    }

    try {
      const repo = this.repositoryManager.getRepository(entityType);

      switch (operation) {
        case 'create': {
          const data = step.config.data as Record<string, unknown> | undefined;
          if (!data) return { output: { result: 'No data provided' }, transition: 'failure' };
          const created = await repo.create(data);
          return { output: { entity: created.data }, transition: 'success' };
        }
        case 'update': {
          const id = step.config.entityId as EntityId | undefined;
          const updateData = step.config.data as Record<string, unknown> | undefined;
          if (!id || !updateData) return { output: { result: 'Missing id or data' }, transition: 'failure' };
          const updated = await repo.update(id, updateData);
          return { output: { entity: updated.data }, transition: 'success' };
        }
        case 'delete': {
          const deleteId = step.config.entityId as EntityId | undefined;
          if (!deleteId) return { output: { result: 'Missing id' }, transition: 'failure' };
          await repo.delete(deleteId);
          return { output: { deleted: true }, transition: 'success' };
        }
        case 'find': {
          const findId = step.config.entityId as EntityId | undefined;
          if (!findId) {
            const all = await repo.findAll();
            return { output: { entities: all.data }, transition: 'success' };
          }
          const found = await repo.findById(findId);
          return { output: { entity: found.data }, transition: 'success' };
        }
        default:
          return { output: { result: 'Unknown operation' }, transition: 'failure' };
      }
    } catch (error) {
      this.logger.error(`Repository operation failed: ${operation} on ${entityType}`, error);
      return {
        output: { error: error instanceof Error ? error.message : String(error) },
        transition: 'failure',
      };
    }
  }

  private async executeRelationship(
    step: WorkflowStepConfig,
    context: Record<string, unknown>,
  ): Promise<{ output: Record<string, unknown>; transition: TransitionType }> {
    if (!this.relationshipService) {
      return { output: { result: 'No relationship service available' }, transition: 'success' };
    }

    const operation = step.config.operation as string | undefined;

    try {
      switch (operation) {
        case 'connect': {
          const sourceId = step.config.sourceId as EntityId;
          const targetId = step.config.targetId as EntityId;
          const type = step.config.relationshipType as string;
          const edge = await this.relationshipService.connect({ sourceId, targetId, type: type as any });
          return { output: { edge: edge as unknown as Record<string, unknown> }, transition: 'success' };
        }
        case 'disconnect': {
          const discSourceId = step.config.sourceId as EntityId;
          const discTargetId = step.config.targetId as EntityId;
          await this.relationshipService.disconnect(discSourceId, discTargetId);
          return { output: { disconnected: true }, transition: 'success' };
        }
        case 'find': {
          const forId = step.config.entityId as EntityId;
          const outgoing = this.relationshipService.getOutgoing(forId);
          return { output: { edges: outgoing as unknown as Record<string, unknown>[] }, transition: 'success' };
        }
        default:
          return { output: { result: `Relationship ${operation} executed` }, transition: 'success' };
      }
    } catch (error) {
      this.logger.error(`Relationship operation failed: ${operation}`, error);
      return {
        output: { error: error instanceof Error ? error.message : String(error) },
        transition: 'failure',
      };
    }
  }

  private async executeDelay(
    _step: WorkflowStepConfig,
  ): Promise<{ output: Record<string, unknown>; transition: TransitionType }> {
    const delayMs = (_step.config.delayMs as number) ?? 1000;
    await this.sleep(delayMs);
    return { output: { delayed: true, delayMs }, transition: 'success' };
  }

  private async executeCustom(
    step: WorkflowStepConfig,
    context: Record<string, unknown>,
  ): Promise<{ output: Record<string, unknown>; transition: TransitionType }> {
    const handler = context[`__handler_${step.id}`];
    if (typeof handler === 'function') {
      return handler(step, context);
    }
    return { output: { result: `Custom step ${step.id} executed` }, transition: 'success' };
  }

  private calculateRetryDelay(policy: RetryPolicy | undefined, attempt: number): number {
    if (!policy) return 0;
    const delay = policy.baseDelayMs * Math.pow(policy.backoffMultiplier, attempt - 1);
    return Math.min(delay, policy.maxDelayMs);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
