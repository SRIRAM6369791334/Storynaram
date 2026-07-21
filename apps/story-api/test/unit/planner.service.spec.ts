import { describe, it, expect } from 'vitest';
import { PlannerService } from '../../src/modules/planner/planner.service';

describe('PlannerService', () => {
  const service = new PlannerService();

  it('should create a plan', async () => {
    const plan = await service.plan({ storyId: 'story-1', genre: 'fantasy' });
    expect(plan.id).toBeDefined();
    expect(plan.status).toBe('planned');
  });

  it('should get plan status', async () => {
    const plan = await service.plan({ storyId: 'story-2' });
    const status = await service.getStatus(plan.id);
    expect(status).not.toBeNull();
    expect(status!.status).toBe('planned');
  });

  it('should return null for unknown plan', async () => {
    const status = await service.getStatus('nonexistent');
    expect(status).toBeNull();
  });
});
