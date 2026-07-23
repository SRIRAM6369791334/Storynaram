import { Injectable, Logger } from '@nestjs/common';
import type { QueryPlan, QueryStep, QueryOptions, QueryClause, LogicalGroup, FilterOperand, QueryEngineOptions } from './types.js';

@Injectable()
export class QueryOptimizer {
  private readonly logger = new Logger(QueryOptimizer.name);
  private readonly enabled: boolean;

  constructor(options?: QueryEngineOptions) {
    this.enabled = options?.enableOptimization ?? true;
  }

  optimize(plan: QueryPlan, _options?: QueryOptions): QueryPlan {
    if (!this.enabled) return plan;

    const appliedOptimizations: string[] = [];
    let steps = [...plan.steps];

    steps = this.reorderSteps(steps, appliedOptimizations);
    steps = this.pushFilterDown(steps, appliedOptimizations);
    steps = this.combineSteps(steps, appliedOptimizations);
    steps = this.removeRedundantSteps(steps, appliedOptimizations);

    const reducedComplexity = steps.reduce((sum, s) => sum + s.cost, 0);

    return {
      ...plan,
      steps,
      estimatedComplexity: reducedComplexity,
      cacheable: plan.cacheable && appliedOptimizations.length < 3,
    };
  }

  private reorderSteps(steps: QueryStep[], applied: string[]): QueryStep[] {
    const filterIdx = steps.findIndex(s => s.type === 'filter');
    const sortIdx = steps.findIndex(s => s.type === 'sort');
    const paginateIdx = steps.findIndex(s => s.type === 'paginate');

    if (filterIdx >= 0 && filterIdx > 0 && steps[0]?.type === 'repository_scan') {
      const removed = steps.splice(filterIdx, 1);
      if (removed.length > 0) {
        steps.splice(1, 0, removed[0]!);
        applied.push('filter_pushdown');
      }
    }

    if (sortIdx >= 0 && sortIdx > filterIdx && filterIdx >= 0) {
      const removed = steps.splice(sortIdx, 1);
      if (removed.length > 0) {
        steps.push(removed[0]!);
        applied.push('sort_late');
      }
    }

    if (paginateIdx >= 0 && paginateIdx < steps.length - 1) {
      const removed = steps.splice(paginateIdx, 1);
      if (removed.length > 0) {
        steps.push(removed[0]!);
        applied.push('paginate_late');
      }
    }

    return steps;
  }

  private pushFilterDown(steps: QueryStep[], applied: string[]): QueryStep[] {
    return steps.map(step => {
      if (step.type === 'relationship_traverse' || step.type === 'join' || step.type === 'expand') {
        applied.push(`pushed_filters_to_${step.type}`);
      }
      return step;
    });
  }

  private combineSteps(steps: QueryStep[], applied: string[]): QueryStep[] {
    const result: QueryStep[] = [];
    for (let i = 0; i < steps.length; i++) {
      const current = steps[i];
      if (!current) continue;
      const next = steps[i + 1];
      if (
        current.type === 'repository_scan' &&
        next &&
        next.type === 'filter' &&
        next.cost < 5
      ) {
        result.push({
          type: 'repository_scan' as const,
          target: current.target,
          cost: current.cost + next.cost,
          description: `Scan ${current.target ?? ''} with filter`,
          detail: { combined: true },
        });
        i++;
        applied.push('scan_filter_combine');
      } else if (
        current.type === 'sort' &&
        next &&
        next.type === 'paginate'
      ) {
        result.push({
          type: 'sort' as const,
          cost: current.cost + next.cost,
          description: `${current.description} + paginate`,
          detail: { combined: true },
        });
        i++;
        applied.push('sort_paginate_combine');
      } else {
        result.push(current);
      }
    }
    return result;
  }

  private removeRedundantSteps(steps: QueryStep[], applied: string[]): QueryStep[] {
    const seen = new Set<string>();
    return steps.filter(step => {
      const key = `${step.type}:${step.target ?? ''}`;
      if (step.type === 'repository_scan' && seen.has(key)) {
        applied.push('dedup_scan');
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}
