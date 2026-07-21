import type { ExecutionGraph, ExecutionTask, TaskStatus } from './execution-graph';
import type { ExecutionContext } from './execution-context';
import type { ExecutionMemory } from './execution-memory';
import { ExecutionQueue } from './execution-queue';
import type { AgentOutput } from './agents/execution-agent';

export type SchedulerMode = 'sequential' | 'parallel';

export interface SchedulerOptions {
  mode: SchedulerMode;
  retryDelay?: number;
  maxRetryDelay?: number;
}

export interface SchedulerResult {
  success: boolean;
  completedTaskIds: string[];
  failedTaskIds: string[];
  taskResults: Map<string, AgentOutput>;
  totalDurationMs: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException('Execution cancelled', 'AbortError');
  }
}

export class ExecutionScheduler {
  async execute(
    graph: ExecutionGraph,
    context: ExecutionContext,
    memory: ExecutionMemory,
    options: SchedulerOptions = { mode: 'parallel', retryDelay: 1000, maxRetryDelay: 30000 },
  ): Promise<SchedulerResult> {
    const startTime = Date.now();
    const currentStatus = new Map<string, TaskStatus>();
    const taskResults = new Map<string, AgentOutput>();
    const completedTaskIds: string[] = [];
    const failedTaskIds: string[] = [];

    for (const [id, task] of graph.tasks) {
      currentStatus.set(id, task.status === 'completed' ? 'completed' : 'pending');
    }

    if (graph.hasCycles()) {
      throw new Error('Execution graph contains cycles');
    }

    try {
      if (options.mode === 'sequential') {
        await this.executeSequential(graph, context, memory, currentStatus, taskResults, completedTaskIds, failedTaskIds, options);
      } else {
        await this.executeParallel(graph, context, memory, currentStatus, taskResults, completedTaskIds, failedTaskIds, options);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        for (const [id] of graph.tasks) {
          if (currentStatus.get(id) === 'pending') {
            currentStatus.set(id, 'cancelled');
          }
        }
      } else {
        throw error;
      }
    }

    return {
      success: failedTaskIds.length === 0,
      completedTaskIds,
      failedTaskIds,
      taskResults,
      totalDurationMs: Date.now() - startTime,
    };
  }

  private async executeSequential(
    graph: ExecutionGraph,
    context: ExecutionContext,
    memory: ExecutionMemory,
    currentStatus: Map<string, TaskStatus>,
    taskResults: Map<string, AgentOutput>,
    completedTaskIds: string[],
    failedTaskIds: string[],
    options: SchedulerOptions,
  ): Promise<void> {
    const layers = graph.getTopologicalLayers();

    for (const layer of layers) {
      for (const task of layer) {
        if (currentStatus.get(task.id) === 'completed') continue;
        checkAborted(context.abortSignal);
        await this.runTask(task, graph, context, memory, currentStatus, taskResults, completedTaskIds, failedTaskIds, options);
      }
    }
  }

  private async executeParallel(
    graph: ExecutionGraph,
    context: ExecutionContext,
    memory: ExecutionMemory,
    currentStatus: Map<string, TaskStatus>,
    taskResults: Map<string, AgentOutput>,
    completedTaskIds: string[],
    failedTaskIds: string[],
    options: SchedulerOptions,
  ): Promise<void> {
    const layers = graph.getTopologicalLayers();

    for (const layer of layers) {
      checkAborted(context.abortSignal);
      const pending = layer.filter(task => currentStatus.get(task.id) !== 'completed');
      const promises = pending.map(task =>
        this.runTask(task, graph, context, memory, currentStatus, taskResults, completedTaskIds, failedTaskIds, options),
      );
      await Promise.all(promises);
    }
  }

  private async runTask(
    task: ExecutionTask,
    graph: ExecutionGraph,
    context: ExecutionContext,
    memory: ExecutionMemory,
    currentStatus: Map<string, TaskStatus>,
    taskResults: Map<string, AgentOutput>,
    completedTaskIds: string[],
    failedTaskIds: string[],
    options: SchedulerOptions,
  ): Promise<void> {
    currentStatus.set(task.id, 'running');
    task.status = 'running';
    task.startedAt = new Date();

    try {
      checkAborted(context.abortSignal);

      const output = await this.executeWithRetry(task, context, memory, options);

      task.status = 'completed';
      task.output = output;
      task.completedAt = new Date();
      task.durationMs = Date.now() - task.startedAt.getTime();
      currentStatus.set(task.id, 'completed');
      taskResults.set(task.id, output);
      completedTaskIds.push(task.id);

      memory.record({
        agentId: task.agent.id,
        stage: task.name,
        output,
        timestamp: new Date(),
        durationMs: task.durationMs,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (error instanceof DOMException && error.name === 'AbortError') {
        task.status = 'cancelled';
        currentStatus.set(task.id, 'cancelled');
        throw error;
      }

      task.status = 'failed';
      task.error = errorMessage;
      task.completedAt = new Date();
      task.durationMs = Date.now() - (task.startedAt?.getTime() ?? Date.now());
      currentStatus.set(task.id, 'failed');
      failedTaskIds.push(task.id);
    }
  }

  private async executeWithRetry(
    task: ExecutionTask,
    context: ExecutionContext,
    memory: ExecutionMemory,
    options: SchedulerOptions,
  ): Promise<AgentOutput> {
    const maxRetries = task.maxRetries;
    const baseDelay = options.retryDelay ?? 1000;
    const maxDelay = options.maxRetryDelay ?? 30000;

    for (let attempt = 1; attempt <= Math.max(maxRetries, 1); attempt++) {
      try {
        checkAborted(context.abortSignal);

        const agentInput = { context, memory };

        const output = await this.executeWithTimeout(
          () => task.agent.execute(agentInput),
          task.timeout,
        );

        memory.setRetryState(task.agent.id, {
          agentId: task.agent.id,
          attempt,
          maxRetries: maxRetries,
          lastError: undefined,
        });

        return output;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw error;
        }

        const isTimeout = error instanceof Error && error.message === 'Task timed out';

        if (attempt >= maxRetries) {
          memory.setRetryState(task.agent.id, {
            agentId: task.agent.id,
            attempt,
            maxRetries: maxRetries,
            lastError: isTimeout ? 'timeout' : (error instanceof Error ? error.message : String(error)),
          });
          throw error;
        }

        memory.setRetryState(task.agent.id, {
          agentId: task.agent.id,
          attempt,
          maxRetries: maxRetries,
          lastError: isTimeout ? 'timeout' : (error instanceof Error ? error.message : String(error)),
          nextRetryAt: new Date(Date.now() + Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay)),
        });

        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
        await sleep(delay);

        checkAborted(context.abortSignal);
      }
    }

    throw new Error(`Task ${task.id} failed after ${maxRetries} retries`);
  }

  private async executeWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Task timed out'));
      }, timeoutMs);

      fn()
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  async resume(
    graph: ExecutionGraph,
    context: ExecutionContext,
    memory: ExecutionMemory,
    completedTaskIds: string[],
    options: SchedulerOptions = { mode: 'parallel', retryDelay: 1000, maxRetryDelay: 30000 },
  ): Promise<SchedulerResult> {
    for (const taskId of completedTaskIds) {
      const task = graph.getTask(taskId);
      if (task !== undefined) {
        const output = memory.getOutput(task.agent.id);
        if (output !== undefined) {
          task.status = 'completed';
          task.output = output;
        }
      }
    }

    return this.execute(graph, context, memory, options);
  }
}
