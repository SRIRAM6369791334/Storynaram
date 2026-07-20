import { Injectable, Logger } from '@nestjs/common';
import { WorkflowDefinition } from './workflow-definition';
import type { WorkflowStatistics } from './types';

@Injectable()
export class WorkflowRegistry {
  private readonly logger = new Logger(WorkflowRegistry.name);
  private readonly definitions = new Map<string, WorkflowDefinition>();

  register(definition: WorkflowDefinition): void {
    const key = `${definition.name}:${definition.version}`;
    if (this.definitions.has(key)) {
      this.logger.warn(`Workflow "${key}" already registered, overwriting`);
    }
    this.definitions.set(key, definition);
    this.logger.log(`Registered workflow: ${key}`);
  }

  unregister(name: string, version: string): boolean {
    const key = `${name}:${version}`;
    const removed = this.definitions.delete(key);
    if (removed) {
      this.logger.log(`Unregistered workflow: ${key}`);
    }
    return removed;
  }

  resolve(name: string, version?: string): WorkflowDefinition {
    if (version) {
      const key = `${name}:${version}`;
      const def = this.definitions.get(key);
      if (!def) {
        throw new Error(`Workflow not found: ${key}`);
      }
      return def;
    }

    const versions = this.listVersions(name);
    if (versions.length === 0) {
      throw new Error(`No workflow found with name: ${name}`);
    }
    const latest = versions.sort().pop()!;
    return this.definitions.get(`${name}:${latest}`)!;
  }

  has(name: string, version?: string): boolean {
    if (version) return this.definitions.has(`${name}:${version}`);
    return this.listNames().includes(name);
  }

  listNames(): string[] {
    return [...new Set(Array.from(this.definitions.keys()).map(k => k.split(':')[0]!))];
  }

  listVersions(name: string): string[] {
    return Array.from(this.definitions.keys())
      .filter(k => k.startsWith(`${name}:`))
      .map(k => k.split(':')[1]!);
  }

  listAll(): WorkflowDefinition[] {
    return Array.from(this.definitions.values());
  }

  clear(): void {
    this.definitions.clear();
  }

  count(): number {
    return this.definitions.size;
  }

  statistics(): WorkflowStatistics {
    return {
      totalWorkflows: this.definitions.size,
      activeWorkflows: 0,
      completedWorkflows: 0,
      failedWorkflows: 0,
      pausedWorkflows: 0,
      averageDurationMs: 0,
      totalStepsExecuted: 0,
      totalRetries: 0,
      totalRollbacks: 0,
      cacheHitRate: 0,
    };
  }
}
