import { DynamicModule, Module, Global } from '@nestjs/common';
import { RelationshipGraph } from './relationship-graph';
import { RelationshipService } from './relationship-service';
import { RelationshipRegistry } from './relationship-registry';
import { RelationshipResolver } from './relationship-resolver';
import { RelationshipTraversalService } from './relationship-traversal.service';
import { RelationshipQueryService } from './relationship-query.service';
import { RelationshipValidator } from './relationship-validator';
import { RelationshipStatisticsService } from './relationship-statistics';
import type { RelationshipRuntimeOptions } from './types';
import { RELATIONSHIP_OPTIONS } from './tokens';

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
