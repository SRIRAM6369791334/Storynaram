import { Injectable, Logger } from '@nestjs/common';
import { RedisConnection } from '../connection/redis-connection';
import type { MetricsData, SlowCommandLog } from '../types';

@Injectable()
export class MetricsCollector {
  private readonly logger = new Logger(MetricsCollector.name);
  private commandCount = 0;
  private cacheHits = 0;
  private cacheMisses = 0;
  private totalLatencyMs = 0;
  private operationCount = 0;
  private slowCommands: SlowCommandLog[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly connection: RedisConnection) {}

  startCollection(intervalMs = 30000): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      this.captureSnapshot().catch((err) => {
        this.logger.error(`Metrics snapshot failed: ${(err as Error).message}`);
      });
    }, intervalMs);
  }

  stopCollection(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  recordCommand(durationMs: number): void {
    this.commandCount++;
    this.totalLatencyMs += durationMs;
    this.operationCount++;
  }

  recordCacheHit(): void {
    this.cacheHits++;
  }

  recordCacheMiss(): void {
    this.cacheMisses++;
  }

  recordSlowCommand(command: string, args: string[], durationMs: number): void {
    this.slowCommands.push({
      command,
      args,
      durationMs,
      timestamp: new Date(),
    });
    if (this.slowCommands.length > 100) {
      this.slowCommands.shift();
    }
  }

  async getMetrics(): Promise<MetricsData> {
    try {
      const [info, dbsize, uptime, connectedClients] = await Promise.all([
        this.connection.info().catch(() => ''),
        this.connection.dbsize().catch(() => 0),
        this.connection.getUptime().catch(() => 0),
        this.connection.getConnectedClients().catch(() => 0),
      ]);

      const memoryUsed = parseInt(info.match(/used_memory:(\d+)/)?.[1] ?? '0', 10);
      const averageLatencyMs = this.operationCount > 0
        ? this.totalLatencyMs / this.operationCount
        : 0;
      const hitRate = (this.cacheHits + this.cacheMisses) > 0
        ? this.cacheHits / (this.cacheHits + this.cacheMisses)
        : 0;

      return {
        commandCount: this.commandCount,
        cacheHits: this.cacheHits,
        cacheMisses: this.cacheMisses,
        hitRate,
        averageLatencyMs,
        operationsPerSecond: this.commandCount / (uptime || 1),
        connectedClients,
        memoryUsed,
        uptimeSeconds: uptime,
        slowCommands: [...this.slowCommands],
      };
    } catch {
      return {
        commandCount: this.commandCount,
        cacheHits: this.cacheHits,
        cacheMisses: this.cacheMisses,
        hitRate: 0,
        averageLatencyMs: 0,
        operationsPerSecond: 0,
        connectedClients: 0,
        memoryUsed: 0,
        uptimeSeconds: 0,
        slowCommands: [],
      };
    }
  }

  async reset(): Promise<void> {
    this.commandCount = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.totalLatencyMs = 0;
    this.operationCount = 0;
    this.slowCommands = [];
  }

  private async captureSnapshot(): Promise<void> {
    const metrics = await this.getMetrics();
    this.logger.debug(
      `Metrics snapshot: ops=${metrics.operationsPerSecond.toFixed(1)}/s, ` +
      `hitRate=${(metrics.hitRate * 100).toFixed(1)}%, ` +
      `latency=${metrics.averageLatencyMs.toFixed(2)}ms, ` +
      `mem=${(metrics.memoryUsed / 1024 / 1024).toFixed(2)}MB`,
    );
  }
}
