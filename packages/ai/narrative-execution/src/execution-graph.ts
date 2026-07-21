import type { ExecutionAgent } from './agents/execution-agent';

export type TaskStatus = 'pending' | 'ready' | 'running' | 'completed' | 'failed' | 'skipped' | 'cancelled';

export interface ExecutionTask {
  id: string;
  name: string;
  agent: ExecutionAgent;
  priority: number;
  dependencies: string[];
  maxRetries: number;
  timeout: number;
  status: TaskStatus;
  output?: unknown;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;
}

export class ExecutionGraph {
  public readonly tasks: Map<string, ExecutionTask> = new Map();
  private adjacencyList: Map<string, string[]> = new Map();

  addTask(task: ExecutionTask): void {
    this.tasks.set(task.id, task);
    if (!this.adjacencyList.has(task.id)) {
      this.adjacencyList.set(task.id, []);
    }
    for (const depId of task.dependencies) {
      const edges = this.adjacencyList.get(depId);
      if (edges) {
        edges.push(task.id);
      } else {
        this.adjacencyList.set(depId, [task.id]);
      }
    }
  }

  getTask(id: string): ExecutionTask | undefined {
    return this.tasks.get(id);
  }

  getReadyTasks(currentStatus: Map<string, TaskStatus>): ExecutionTask[] {
    return Array.from(this.tasks.values()).filter(task => {
      const s = currentStatus.get(task.id) ?? task.status;
      if (s !== 'pending') return false;
      return task.dependencies.every(depId => {
        const dep = this.tasks.get(depId);
        return dep !== undefined && (currentStatus.get(depId) ?? dep.status) === 'completed';
      });
    });
  }

  getDependents(taskId: string): ExecutionTask[] {
    return Array.from(this.tasks.values()).filter(t => t.dependencies.includes(taskId));
  }

  hasCycles(): boolean {
    const visited = new Set<string>();
    const inStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      inStack.add(nodeId);
      const edges = this.adjacencyList.get(nodeId) ?? [];
      for (const neighbor of edges) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (inStack.has(neighbor)) {
          return true;
        }
      }
      inStack.delete(nodeId);
      return false;
    };

    for (const taskId of this.tasks.keys()) {
      if (!visited.has(taskId)) {
        if (dfs(taskId)) return true;
      }
    }
    return false;
  }

  getTopologicalLayers(): ExecutionTask[][] {
    const inDegree = new Map<string, number>();
    const taskMap = new Map<string, ExecutionTask>();

    for (const [id, task] of this.tasks) {
      inDegree.set(id, 0);
      taskMap.set(id, task);
    }

    for (const task of this.tasks.values()) {
      for (const depId of task.dependencies) {
        inDegree.set(task.id, (inDegree.get(task.id) ?? 0) + 1);
      }
    }

    const layers: ExecutionTask[][] = [];
    let currentLayer = Array.from(inDegree.entries())
      .filter(([_, deg]) => deg === 0)
      .map(([id]) => taskMap.get(id)!)
      .filter(t => t !== undefined);

    while (currentLayer.length > 0) {
      layers.push(currentLayer);
      const nextLayer: ExecutionTask[] = [];
      for (const task of currentLayer) {
        const edges = this.adjacencyList.get(task.id) ?? [];
        for (const neighborId of edges) {
          const newDeg = (inDegree.get(neighborId) ?? 1) - 1;
          inDegree.set(neighborId, newDeg);
          if (newDeg === 0) {
            const neighbor = taskMap.get(neighborId);
            if (neighbor !== undefined) nextLayer.push(neighbor);
          }
        }
      }
      currentLayer = nextLayer;
    }

    return layers;
  }

  get totalTasks(): number {
    return this.tasks.size;
  }

  get completedCount(): number {
    return Array.from(this.tasks.values()).filter(t => t.status === 'completed').length;
  }

  get failedCount(): number {
    return Array.from(this.tasks.values()).filter(t => t.status === 'failed').length;
  }

  reset(): void {
    for (const task of this.tasks.values()) {
      task.status = 'pending';
      task.output = undefined;
      task.error = undefined;
      task.startedAt = undefined;
      task.completedAt = undefined;
      task.durationMs = undefined;
    }
  }
}
