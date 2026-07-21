import { Injectable } from '@nestjs/common';

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: Record<string, { status: string; details?: string }>;
}

@Injectable()
export class HealthService {
  async check(): Promise<HealthCheckResult> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        api: { status: 'up' },
        memory: {
          status: process.memoryUsage().heapUsed > 500 * 1024 * 1024 ? 'degraded' : 'up',
          details: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB used`,
        },
      },
    };
  }
}
