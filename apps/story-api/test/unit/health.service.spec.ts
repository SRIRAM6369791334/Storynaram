import { describe, it, expect } from 'vitest';
import { HealthService } from '../../src/modules/health/health.service';

describe('HealthService', () => {
  const service = new HealthService();

  it('should return health check result', async () => {
    const result = await service.check();
    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
    expect(result.uptime).toBeGreaterThan(0);
    expect(result.checks.api.status).toBe('up');
  });
});
