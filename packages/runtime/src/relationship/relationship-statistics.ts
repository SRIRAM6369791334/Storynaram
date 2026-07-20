import { Injectable } from '@nestjs/common';
import { RelationshipGraph } from './relationship-graph';
import { RelationshipRegistry } from './relationship-registry';
import type { GraphStatistics } from './types';

@Injectable()
export class RelationshipStatisticsService {
  constructor(
    private readonly graph: RelationshipGraph,
    private readonly registry: RelationshipRegistry,
  ) {}

  getGraphStatistics(): GraphStatistics {
    return this.graph.statistics();
  }

  getRegistryStatistics(): {
    totalTypes: number;
    types: string[];
  } {
    return {
      totalTypes: this.registry.listTypes().length,
      types: this.registry.listTypes(),
    };
  }

  getFullReport(): {
    graph: GraphStatistics;
    registry: { totalTypes: number; types: string[] };
  } {
    return {
      graph: this.graph.statistics(),
      registry: {
        totalTypes: this.registry.listTypes().length,
        types: this.registry.listTypes(),
      },
    };
  }
}
