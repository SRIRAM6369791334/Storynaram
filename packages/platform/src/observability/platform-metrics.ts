export interface PlatformMetric {
  name: string;
  value: number;
  tags: Record<string, string>;
  timestamp: Date;
}

export interface MetricSnapshot {
  metrics: PlatformMetric[];
  totalMetrics: number;
  recordedAt: Date;
}

export class PlatformMetrics {
  private readonly metrics: PlatformMetric[] = [];
  private readonly counters = new Map<string, number>();
  private readonly gauges = new Map<string, number>();

  incrementCounter(name: string, tags: Record<string, string> = {}): void {
    const key = this.makeKey(name, tags);
    this.counters.set(key, (this.counters.get(key) ?? 0) + 1);
    this.record(name, this.counters.get(key)!, tags);
  }

  setGauge(name: string, value: number, tags: Record<string, string> = {}): void {
    const key = this.makeKey(name, tags);
    this.gauges.set(key, value);
    this.record(name, value, tags);
  }

  recordMetric(name: string, value: number, tags: Record<string, string> = {}): void {
    this.record(name, value, tags);
  }

  getCounter(name: string, tags: Record<string, string> = {}): number {
    return this.counters.get(this.makeKey(name, tags)) ?? 0;
  }

  getGauge(name: string, tags: Record<string, string> = {}): number {
    return this.gauges.get(this.makeKey(name, tags)) ?? 0;
  }

  getSnapshot(): MetricSnapshot {
    return {
      metrics: [...this.metrics],
      totalMetrics: this.metrics.length,
      recordedAt: new Date(),
    };
  }

  getMetricsByName(name: string): PlatformMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  clear(): void {
    this.metrics.length = 0;
    this.counters.clear();
    this.gauges.clear();
  }

  private record(name: string, value: number, tags: Record<string, string>): void {
    this.metrics.push({ name, value, tags, timestamp: new Date() });
  }

  private makeKey(name: string, tags: Record<string, string>): string {
    const tagStr = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return tagStr ? `${name}{${tagStr}}` : name;
  }
}
