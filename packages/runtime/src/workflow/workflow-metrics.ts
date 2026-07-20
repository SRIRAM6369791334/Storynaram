import { Injectable } from '@nestjs/common';
import type { WorkflowMetrics, WorkflowStatistics, WorkflowResult } from './types';

interface WorkflowMetricData {
  durations: number[];
  successes: number;
  failures: number;
  retries: number;
}

@Injectable()
export class WorkflowMetricsService {
  private readonly metrics = new Map<string, WorkflowMetricData>();

  record(result: WorkflowResult): void {
    const name = result.workflowName;
    const data = this.metrics.get(name) ?? { durations: [], successes: 0, failures: 0, retries: 0 };
    data.durations.push(result.totalDurationMs);
    if (data.durations.length > 1000) {
      data.durations.shift();
    }
    if (result.status === 'Completed' || result.status === 'Archived') {
      data.successes++;
    } else {
      data.failures++;
    }
    data.retries += result.steps.filter(s => s.retryAttempt > 0).length;
    this.metrics.set(name, data);
  }

  getMetrics(workflowName: string): WorkflowMetrics | undefined {
    const data = this.metrics.get(workflowName);
    if (!data) return undefined;

    const sorted = [...data.durations].sort((a, b) => a - b);
    const len = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);

    return {
      workflowName,
      executionCount: data.successes + data.failures,
      successCount: data.successes,
      failureCount: data.failures,
      averageDurationMs: len > 0 ? sum / len : 0,
      minDurationMs: len > 0 ? sorted[0]! : 0,
      maxDurationMs: len > 0 ? sorted[len - 1]! : 0,
      p50DurationMs: len > 0 ? sorted[Math.floor(len * 0.5)] ?? 0 : 0,
      p95DurationMs: len > 0 ? sorted[Math.floor(len * 0.95)] ?? 0 : 0,
      p99DurationMs: len > 0 ? sorted[Math.floor(len * 0.99)] ?? 0 : 0,
      totalRetries: data.retries,
    };
  }

  getAllMetrics(): WorkflowMetrics[] {
    return Array.from(this.metrics.keys()).map(name => this.getMetrics(name)!);
  }

  getAggregateStatistics(
    totalWorkflows: number,
    activeWorkflows: number,
  ): WorkflowStatistics {
    const allDurations: number[] = [];
    let totalSteps = 0;
    let totalRetries = 0;
    let totalRollbacks = 0;
    let completed = 0;
    let failed = 0;

    for (const [, data] of this.metrics) {
      allDurations.push(...data.durations);
      totalSteps += data.durations.length;
      totalRetries += data.retries;
      completed += data.successes;
      failed += data.failures;
    }

    const sorted = [...allDurations].sort((a, b) => a - b);
    const len = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);

    return {
      totalWorkflows,
      activeWorkflows,
      completedWorkflows: completed,
      failedWorkflows: failed,
      pausedWorkflows: 0,
      averageDurationMs: len > 0 ? sum / len : 0,
      totalStepsExecuted: totalSteps,
      totalRetries,
      totalRollbacks,
      cacheHitRate: 0,
    };
  }

  reset(): void {
    this.metrics.clear();
  }
}
