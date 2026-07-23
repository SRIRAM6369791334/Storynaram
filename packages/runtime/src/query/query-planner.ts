import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type {
  QueryOptions,
  QueryPlan,
  QueryStep,
  QueryClause,
  LogicalGroup,
  FilterOperand,
  QueryEngineOptions,
} from './types.js';
import type { EntityId } from '@storynaram/core';
import { QueryContext } from './query-context.js';

@Injectable()
export class QueryPlanner {
  private readonly logger = new Logger(QueryPlanner.name);

  constructor(private readonly options: QueryEngineOptions) {}

  plan(entityType: string, options?: QueryOptions): QueryPlan {
    const steps: QueryStep[] = [];
    let complexity = 0;

    const scanStep: QueryStep = {
      type: 'repository_scan',
      target: entityType,
      cost: 10,
      description: `Scan repository for ${entityType}`,
    };
    steps.push(scanStep);
    complexity += 10;

    if (options?.filter && !isEmptyClause(options.filter)) {
      const filterCost = this.estimateFilterCost(options.filter);
      steps.push({
        type: 'filter',
        cost: filterCost,
        description: 'Apply filter conditions',
        detail: { filterComplexity: this.countFilterConditions(options.filter) },
      });
      complexity += filterCost;
    }

    if (options?.includes && options.includes.length > 0) {
      for (const include of options.includes) {
        const joinStep: QueryStep = {
          type: 'join',
          target: include.relation,
          cost: 15,
          description: `Include relation: ${include.relation}`,
          detail: { as: include.as ?? include.relation },
        };
        steps.push(joinStep);
        complexity += 15;
      }
    }

    if (options?.expands && options.expands.length > 0) {
      for (const expand of options.expands) {
        steps.push({
          type: 'expand',
          target: expand.path,
          cost: 20 * (expand.maxDepth ?? 1),
          description: `Expand path: ${expand.path}`,
          detail: { maxDepth: expand.maxDepth ?? 1 },
        });
        complexity += 20 * (expand.maxDepth ?? 1);
      }
    }

    if (options?.sort && options.sort.length > 0) {
      const sortCost = 5 + options.sort.length * 2;
      steps.push({
        type: 'sort',
        cost: sortCost,
        description: `Sort by ${options.sort.map(s => `${s.field}:${s.direction}`).join(', ')}`,
        detail: { fields: options.sort.length },
      });
      complexity += sortCost;
    }

    if (options?.pagination) {
      steps.push({
        type: 'paginate',
        cost: 3,
        description: `Apply ${options.pagination.type} pagination (limit: ${String(options.pagination.limit)})`,
        detail: { type: options.pagination.type, limit: options.pagination.limit },
      });
      complexity += 3;
    }

    if (options?.projection) {
      steps.push({
        type: 'project',
        cost: 2,
        description: 'Apply projection',
        detail: {
          select: options.projection.select?.length ?? 0,
          exclude: options.projection.exclude?.length ?? 0,
        },
      });
      complexity += 2;
    }

    const id = uuid();
    const estimatedRows = this.estimateRows(entityType, complexity);

    return {
      id,
      entityType,
      steps,
      estimatedComplexity: complexity,
      estimatedRows,
      cacheable: this.isCacheable(options),
      parallelizable: this.isParallelizable(steps),
    };
  }

  private estimateFilterCost(filter: QueryClause): number {
    return this.countFilterConditions(filter) * 3;
  }

  private countFilterConditions(clause: QueryClause): number {
    if (isLogicalGroup(clause)) {
      return clause.conditions.reduce(
        (sum, c) => sum + this.countFilterConditions(c),
        0,
      );
    }
    return 1;
  }

  private estimateRows(_entityType: string, _complexity: number): number {
    return 100;
  }

  private isCacheable(options?: QueryOptions): boolean {
    if (!options) return true;
    return !options.expands || options.expands.length === 0;
  }

  private isParallelizable(steps: QueryStep[]): boolean {
    return steps.length <= 3;
  }
}

function isEmptyClause(clause: QueryClause): boolean {
  if (isLogicalGroup(clause)) {
    return clause.conditions.length === 0;
  }
  return false;
}

function isLogicalGroup(clause: QueryClause): clause is LogicalGroup {
  return 'operator' in clause && 'conditions' in clause;
}
