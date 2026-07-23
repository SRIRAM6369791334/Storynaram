import { DynamicModule, Module, Global } from '@nestjs/common';
import { RelationshipGraph } from './relationship-graph.js';
import { RelationshipService } from './relationship-service.js';
import { RelationshipRegistry } from './relationship-registry.js';
import { RelationshipResolver } from './relationship-resolver.js';
import { RelationshipTraversalService } from './relationship-traversal.service.js';
import { RelationshipQueryService } from './relationship-query.service.js';
import { RelationshipValidator } from './relationship-validator.js';
import { RelationshipStatisticsService } from './relationship-statistics.js';
import type { RelationshipRuntimeOptions } from './types.js';
import { RELATIONSHIP_OPTIONS } from './tokens.js';

@Global()
@Module({})
export class RelationshipRuntimeModule {
  static forRoot(options?: RelationshipRuntimeOptions): DynamicModule {
    return {
      module: RelationshipRuntimeModule,
      global: true,
      providers: [
        { provide: RELATIONSHIP_OPTIONS, useValue: options ?? {} },
        RelationshipGraph,
        RelationshipRegistry,
        RelationshipTraversalService,
        RelationshipQueryService,
        RelationshipValidator,
        RelationshipStatisticsService,
        {
          provide: RelationshipResolver,
          useFactory: (
            graph: RelationshipGraph,
            repositoryRegistry?: any,
          ) => new RelationshipResolver(graph, repositoryRegistry),
          inject: [RelationshipGraph, { token: 'REPOSITORY_REGISTRY', optional: true }],
        },
        {
          provide: RelationshipService,
          useFactory: (
            traversal: RelationshipTraversalService,
            queryService: RelationshipQueryService,
            validator: RelationshipValidator,
            cache?: any,
            events?: any,
            config?: any,
          ) => new RelationshipService(traversal, queryService, validator, cache, events, config),
          inject: [
            RelationshipTraversalService,
            RelationshipQueryService,
            RelationshipValidator,
            { token: 'CACHE_SERVICE', optional: true },
            { token: 'EVENT_SERVICE', optional: true },
            { token: 'RUNTIME_CONFIG', optional: true },
          ],
        },
        {
          provide: 'RelationshipPort',
          useExisting: RelationshipService,
        },
      ],
      exports: [
        RelationshipGraph,
        RelationshipService,
        RelationshipRegistry,
        RelationshipResolver,
        RelationshipTraversalService,
        RelationshipQueryService,
        RelationshipValidator,
        RelationshipStatisticsService,
        'RelationshipPort',
      ],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: RelationshipRuntimeModule,
      providers: [
        RelationshipGraph,
        RelationshipTraversalService,
        RelationshipQueryService,
        RelationshipValidator,
        RelationshipStatisticsService,
        RelationshipService,
        RelationshipResolver,
        RelationshipRegistry,
      ],
      exports: [
        RelationshipGraph,
        RelationshipService,
        RelationshipRegistry,
        RelationshipResolver,
        RelationshipTraversalService,
        RelationshipQueryService,
        RelationshipValidator,
        RelationshipStatisticsService,
      ],
    };
  }
}
