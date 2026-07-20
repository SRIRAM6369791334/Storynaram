import { Injectable, Logger } from '@nestjs/common';
import { RedisConnection } from '../connection/redis-connection';
import type { HealthCheckResult } from '../types';

@Injectable()
export class RedisHealthIndicator {
  private readonly logger = new Logger(RedisHealthIndicator.name);

  constructor(private readonly connection: RedisConnection) {}

  async isHealthy(): Promise<HealthCheckResult> {
    const lastChecked = new Date();
    try {
      const pingStart = Date.now();
      const isConnected = await this.connection.ping();
      const latency = Date.now() - pingStart;

      if (!isConnected) {
        return {
          status: 'unhealthy',
          connection: false,
          latency,
          uptime: 0,
          lastChecked,
        };
      }

      const [memory, uptime, connectedClients] = await Promise.all([
        this.connection.getMemoryInfo().catch(() => undefined),
        this.connection.getUptime().catch(() => 0),
        this.connection.getConnectedClients().catch(() => undefined),
      ]);

      const status = latency < 1000 ? 'healthy' : 'degraded';

      return {
        status,
        connection: true,
        latency,
        memory,
        uptime,
        connectedClients,
        lastChecked,
      };
    } catch (err) {
      this.logger.error(`Health check failed: ${(err as Error).message}`);
      return {
        status: 'unhealthy',
        connection: false,
        latency: -1,
        uptime: 0,
        lastChecked,
      };
    }
  }

  async checkConnectivity(): Promise<boolean> {
    try {
      return this.connection.ping();
    } catch {
      return false;
    }
  }

  async getLatency(): Promise<number> {
    const start = Date.now();
    try {
      await this.connection.ping();
      return Date.now() - start;
    } catch {
      return -1;
    }
  }
}
