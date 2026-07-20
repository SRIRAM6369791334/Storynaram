import { Injectable, Logger } from '@nestjs/common';
import { RedisConnection } from '../connection/redis-connection';
import type { ProviderStatistics } from '../types';
import { RedisHealthIndicator } from '../health/health-indicator';
import { MetricsCollector } from '../metrics/metrics-collector';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);
  private totalOperations = 0;
  private errorCount = 0;

  constructor(
    private readonly connection: RedisConnection,
    private readonly healthIndicator: RedisHealthIndicator,
    private readonly metricsCollector: MetricsCollector,
  ) {}

  recordOperation(): void {
    this.totalOperations++;
  }

  recordError(): void {
    this.errorCount++;
  }

  async getStatistics(): Promise<ProviderStatistics> {
    try {
      const [health, metrics, uptime] = await Promise.all([
        this.healthIndicator.isHealthy(),
        this.metricsCollector.getMetrics(),
        this.connection.getUptime().catch(() => 0),
      ]);

      return {
        totalOperations: this.totalOperations,
        cacheHitRate: metrics.hitRate,
        averageLatencyMs: metrics.averageLatencyMs,
        errorCount: this.errorCount,
        uptimeMs: uptime * 1000,
        memoryUsage: metrics.memoryUsed,
        connectedClients: metrics.connectedClients,
      };
    } catch {
      return {
        totalOperations: this.totalOperations,
        cacheHitRate: 0,
        averageLatencyMs: 0,
        errorCount: this.errorCount,
        uptimeMs: 0,
        memoryUsage: 0,
        connectedClients: 0,
      };
    }
  }

  async reset(): Promise<void> {
    this.totalOperations = 0;
    this.errorCount = 0;
    await this.metricsCollector.reset();
  }
}
