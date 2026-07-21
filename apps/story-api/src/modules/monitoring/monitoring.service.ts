import { Injectable, Logger } from '@nestjs/common';

export interface MetricEntry {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp: Date;
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private readonly metrics: MetricEntry[] = [];
  private requestCount = 0;
  private errorCount = 0;
  private startTime = Date.now();

  recordRequest(): void {
    this.requestCount++;
  }

  recordError(): void {
    this.errorCount++;
  }

  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    this.metrics.push({ name, value, tags, timestamp: new Date() });
  }

  getStats(): Record<string, unknown> {
    return {
      uptime: Date.now() - this.startTime,
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      errorRate: this.requestCount > 0 ? ((this.errorCount / this.requestCount) * 100).toFixed(2) : 0,
      memoryUsage: process.memoryUsage(),
      metricsCount: this.metrics.length,
    };
  }
}
