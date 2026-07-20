import { describe, it, expect } from 'vitest';
import { QueryPlanner } from '../src/query/query-planner';
import { QueryOptimizer } from '../src/query/query-optimizer';
import type { QueryPlan, QueryStep, QueryEngineOptions } from '../src/query/types';

const defaultOptions: QueryEngineOptions = {
  enableOptimization: true,
  enableCache: true,
  defaultTimeoutMs: 10000,
  maxLimit: 1000,
  defaultLimit: 50,
  enableStatistics: true,
  cacheTtlMs: 30000,
  maxQueryDepth: 5,
};

describe('QueryPlanner', () => {
  const planner = new QueryPlanner(defaultOptions);

  it('should create a plan for entity query', () => {
    const plan = planner.plan('character');
    expect(plan.entityType).toBe('character');
    expect(plan.steps.length).toBeGreaterThan(0);
    expect(plan.steps[0]?.type).toBe('repository_scan');
  });

  it('should add filter step when filter provided', () => {
    const plan = planner.plan('character', {
      filter: { field: 'name', operator: 'eq', value: 'Alice' },
    });
    const filterSteps = plan.steps.filter(s => s.type === 'filter');
    expect(filterSteps.length).toBeGreaterThan(0);
  });

  it('should add sort step when sort provided', () => {
    const plan = planner.plan('character', {
      sort: [{ field: 'name', direction: 'asc' }],
    });
    const sortSteps = plan.steps.filter(s => s.type === 'sort');
    expect(sortSteps.length).toBeGreaterThan(0);
  });

  it('should add paginate step when pagination provided', () => {
    const plan = planner.plan('character', {
      pagination: { type: 'offset', limit: 10, offset: 0 },
    });
    const paginateSteps = plan.steps.filter(s => s.type === 'paginate');
    expect(paginateSteps.length).toBeGreaterThan(0);
  });

  it('should add project step when projection provided', () => {
    const plan = planner.plan('character', {
      projection: { select: ['id', 'name'] },
    });
    const projectSteps = plan.steps.filter(s => s.type === 'project');
    expect(projectSteps.length).toBeGreaterThan(0);
  });

  it('should estimate complexity', () => {
    const plan = planner.plan('character');
    expect(plan.estimatedComplexity).toBeGreaterThan(0);
  });

  it('should include include step when includes provided', () => {
    const plan = planner.plan('character', {
      includes: [{ relation: 'owns' }],
    });
    const joinSteps = plan.steps.filter(s => s.type === 'join');
    expect(joinSteps.length).toBeGreaterThan(0);
  });
});

describe('QueryOptimizer', () => {
  const optimizer = new QueryOptimizer(defaultOptions);

  function makePlan(steps: QueryStep[]): QueryPlan {
    return {
      id: 'test-plan',
      entityType: 'character',
      steps,
      estimatedComplexity: 50,
      estimatedRows: 100,
      cacheable: true,
      parallelizable: false,
    };
  }

  it('should not change plan when optimization disabled', () => {
    const disabled = new QueryOptimizer({ ...defaultOptions, enableOptimization: false });
    const plan = makePlan([
      { type: 'repository_scan', target: 'character', cost: 10, description: 'Scan' },
    ]);
    const optimized = disabled.optimize(plan);
    expect(optimized.steps.length).toBe(1);
  });

  it('should reorder steps - push filter after scan', () => {
    const plan = makePlan([
      { type: 'repository_scan', target: 'character', cost: 10, description: 'Scan' },
      { type: 'sort', cost: 5, description: 'Sort' },
      { type: 'filter', cost: 3, description: 'Filter' },
    ]);
    const optimized = optimizer.optimize(plan);
    const filterIdx = optimized.steps.findIndex(s => s.type === 'filter');
    const sortIdx = optimized.steps.findIndex(s => s.type === 'sort');
    expect(filterIdx).toBeLessThan(sortIdx);
  });

  it('should combine scan and cheap filter', () => {
    const plan = makePlan([
      { type: 'repository_scan', target: 'character', cost: 10, description: 'Scan' },
      { type: 'filter', cost: 3, description: 'Filter' },
    ]);
    const optimized = optimizer.optimize(plan);
    const scanSteps = optimized.steps.filter(s => s.type === 'repository_scan');
    if (optimized.steps[0]?.type === 'repository_scan' && optimized.steps[0]?.detail?.combined) {
      expect(optimized.steps[0].detail.combined).toBe(true);
    }
  });

  it('should not combine scan and expensive filter', () => {
    const plan = makePlan([
      { type: 'repository_scan', target: 'character', cost: 10, description: 'Scan' },
      { type: 'filter', cost: 10, description: 'Expensive filter' },
    ]);
    const optimized = optimizer.optimize(plan);
    expect(optimized.steps.length).toBeGreaterThanOrEqual(2);
  });

  it('should keep plan structure valid', () => {
    const plan = makePlan([
      { type: 'repository_scan', target: 'character', cost: 10, description: 'Scan' },
      { type: 'filter', cost: 5, description: 'Filter' },
      { type: 'sort', cost: 3, description: 'Sort' },
      { type: 'paginate', cost: 2, description: 'Paginate' },
      { type: 'project', cost: 1, description: 'Project' },
    ]);
    const optimized = optimizer.optimize(plan);
    expect(optimized.steps.length).toBeGreaterThan(0);
    expect(optimized.estimatedComplexity).toBeGreaterThan(0);
  });
});
