import { Injectable, Inject, Logger } from '@nestjs/common';
import { SEARCH_PROVIDER } from '../tokens.js';
import type { SearchProvider } from '../search-provider.interface.js';

export interface SearchHealthResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  provider: string;
  clusterStatus: string;
  nodeCount: number;
  activeShards: number;
  unassignedShards: number;
  pendingTasks: number;
  latency: number;
  indices: string[];
  timestamp: Date;
}

@Injectable()
export class SearchHealthIndicator {
  private readonly logger = new Logger(SearchHealthIndicator.name);

  constructor(
    @Inject(SEARCH_PROVIDER) private readonly provider: SearchProvider,
  ) {}

  async check(): Promise<SearchHealthResult> {
    const start = Date.now();
    let latency = 0;

    try {
      const available = await this.provider.ping();
      if (!available) {
        return {
          status: 'unhealthy',
          provider: this.provider.name,
          clusterStatus: 'unavailable',
          nodeCount: 0,
          activeShards: 0,
          unassignedShards: 0,
          pendingTasks: 0,
          latency: Date.now() - start,
          indices: [],
          timestamp: new Date(),
        };
      }

      latency = Date.now() - start;
      const health = await this.provider.clusterHealth();
      const indices = await this.provider.listIndices();

      const status: SearchHealthResult['status'] =
        health.status === 'green' ? 'healthy'
          : health.status === 'yellow' ? 'degraded'
            : 'unhealthy';

      return {
        status,
        provider: this.provider.name,
        clusterStatus: health.status,
        nodeCount: health.numberOfNodes,
        activeShards: health.activeShards,
        unassignedShards: health.unassignedShards,
        pendingTasks: health.pendingTasks,
        latency,
        indices,
        timestamp: new Date(),
      };
    } catch (err) {
      this.logger.error('Health check failed', err);
      return {
        status: 'unhealthy',
        provider: this.provider.name,
        clusterStatus: 'error',
        nodeCount: 0,
        activeShards: 0,
        unassignedShards: 0,
        pendingTasks: 0,
        latency: Date.now() - start,
        indices: [],
        timestamp: new Date(),
      };
    }
  }
}
