import { Injectable, Inject, Logger } from '@nestjs/common';
import { SEARCH_PROVIDER } from '../tokens';
import type { SearchProvider } from '../search-provider.interface';
import { SearchMetricsCollector } from './search-metrics';

export interface SearchStatisticsResult {
  totalQueries: number;
  totalIndexed: number;
  totalDeleted: number;
  totalBulkOperations: number;
  totalAutocompletes: number;
  totalErrors: number;
  averageQueryTime: number;
  queryLatencyP50: number;
  queryLatencyP95: number;
  queryLatencyP99: number;
  indexCount: number;
  totalDocs: number;
  indexSizeBytes: number;
  clusterStatus: string;
  clusterNodes: number;
}

@Injectable()
export class SearchStatisticsService {
  private readonly logger = new Logger(SearchStatisticsService.name);

  constructor(
    @Inject(SEARCH_PROVIDER) private readonly provider: SearchProvider,
    private readonly metrics: SearchMetricsCollector,
  ) {}

  async getStatistics(): Promise<SearchStatisticsResult> {
    const m = this.metrics.getMetrics();
    let clusterStatus = 'unknown';
    let clusterNodes = 0;

    try {
      const health = await this.provider.clusterHealth();
      clusterStatus = health.status;
      clusterNodes = health.numberOfNodes;
    } catch (err) {
      this.logger.warn('Failed to fetch cluster health', err);
    }

    let indexCount = 0;
    try {
      const indices = await this.provider.listIndices();
      indexCount = indices.length;
    } catch {
      // ignore
    }

    return {
      totalQueries: m.queryCount,
      totalIndexed: m.indexCount,
      totalDeleted: m.deleteCount,
      totalBulkOperations: m.bulkCount,
      totalAutocompletes: m.autocompleteCount,
      totalErrors: m.errors,
      averageQueryTime: m.queryCount > 0 ? m.totalTook / m.queryCount : 0,
      queryLatencyP50: this.metrics.getPercentileLatency('search', 50),
      queryLatencyP95: this.metrics.getPercentileLatency('search', 95),
      queryLatencyP99: this.metrics.getPercentileLatency('search', 99),
      indexCount,
      totalDocs: m.docCount,
      indexSizeBytes: m.indexSizeBytes,
      clusterStatus,
      clusterNodes,
    };
  }
}
