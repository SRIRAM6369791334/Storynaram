import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { createWorkerConfig } from '../config/worker.config.js';

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  uptime: number;
  memory: {
    used: string;
    free: string;
    total: string;
  };
  redis: {
    connected: boolean;
    latency?: number;
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly redis: Redis;
  private readonly startTime: number = Date.now();

  constructor() {
    const config = createWorkerConfig();
    this.redis = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }

  async getHealth(): Promise<HealthStatus> {
    const mem = process.memoryUsage();
    let redisConnected = false;
    let redisLatency: number | undefined;

    try {
      const start = Date.now();
      await this.redis.ping();
      redisLatency = Date.now() - start;
      redisConnected = true;
    } catch {
      redisConnected = false;
    }

    return {
      status: redisConnected ? 'ok' : 'degraded',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      memory: {
        used: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        free: `${((mem.heapTotal - mem.heapUsed) / 1024 / 1024).toFixed(2)} MB`,
        total: `${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      },
      redis: {
        connected: redisConnected,
        latency: redisLatency,
      },
    };
  }
}
