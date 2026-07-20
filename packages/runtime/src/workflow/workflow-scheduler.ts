import { Injectable, Logger } from '@nestjs/common';

interface ScheduledTask {
  id: string;
  execute: () => Promise<void>;
  priority: number;
}

@Injectable()
export class WorkflowScheduler {
  private readonly logger = new Logger(WorkflowScheduler.name);
  private readonly queue: ScheduledTask[] = [];
  private running = 0;
  private maxConcurrent: number;
  private processing = false;

  constructor() {
    this.maxConcurrent = 4;
  }

  schedule(task: () => Promise<void>, priority: number = 0): void {
    const id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.queue.push({ id, execute: task, priority });
    this.queue.sort((a, b) => b.priority - a.priority);
    this.processQueue();
  }

  async executeAll(tasks: (() => Promise<void>)[]): Promise<void> {
    const results = await Promise.allSettled(tasks.map(t => t()));
    for (const result of results) {
      if (result.status === 'rejected') {
        this.logger.error('Scheduled task failed', result.reason);
      }
    }
  }

  async executeParallel(
    tasks: (() => Promise<void>)[],
    maxConcurrency?: number,
  ): Promise<void> {
    const concurrency = maxConcurrency ?? this.maxConcurrent;
    const running: Promise<void>[] = [];

    for (const task of tasks) {
      if (running.length >= concurrency) {
        await Promise.race(running);
      }
      const p = task().then(() => {
        const idx = running.indexOf(p);
        if (idx >= 0) running.splice(idx, 1);
      });
      running.push(p);
    }

    await Promise.all(running);
  }

  setMaxConcurrent(max: number): void {
    this.maxConcurrent = max;
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getRunningCount(): number {
    return this.running;
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0 && this.running < this.maxConcurrent) {
      const task = this.queue.shift();
      if (!task) break;

      this.running++;
      task.execute().finally(() => {
        this.running--;
        this.processQueue();
      });
    }

    this.processing = false;
  }
}
