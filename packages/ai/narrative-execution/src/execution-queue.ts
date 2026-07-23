import type { ExecutionTask } from './execution-graph.js';

export class ExecutionQueue {
  private tasks: ExecutionTask[] = [];

  enqueue(task: ExecutionTask): void {
    this.tasks.push(task);
    this.tasks.sort((a, b) => b.priority - a.priority);
  }

  enqueueBatch(tasks: ExecutionTask[]): void {
    this.tasks.push(...tasks);
    this.tasks.sort((a, b) => b.priority - a.priority);
  }

  dequeue(): ExecutionTask | undefined {
    return this.tasks.shift();
  }

  peek(): ExecutionTask | undefined {
    return this.tasks[0];
  }

  get size(): number {
    return this.tasks.length;
  }

  clear(): void {
    this.tasks = [];
  }

  getAll(): ExecutionTask[] {
    return [...this.tasks];
  }

  remove(taskId: string): boolean {
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      return true;
    }
    return false;
  }

  isEmpty(): boolean {
    return this.tasks.length === 0;
  }
}
