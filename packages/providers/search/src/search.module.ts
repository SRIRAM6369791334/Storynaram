import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import {
  SEARCH_MODULE_OPTIONS, SEARCH_PROVIDER, SEARCH_CLIENT, SEARCH_REGISTRY,
  SEARCH_INDEX_MANAGER, SEARCH_DOCUMENT_MAPPER, SEARCH_BULK_INDEXER,
  SEARCH_QUERY_COMPILER, SEARCH_RESULT_MAPPER,
  SEARCH_HEALTH_INDICATOR, SEARCH_METRICS_COLLECTOR, SEARCH_STATISTICS_SERVICE,
} from './tokens';
import { SearchClient } from './search-client';
import { SearchRegistry } from './search-registry';
import { SearchIndexManager } from './search-index-manager';
import { DocumentMapper } from './document-mapper';
import { BulkIndexer } from './bulk-indexer';
import { SearchQueryCompiler } from './search-query-compiler';
import { SearchResultMapper } from './search-result-mapper';
import { SearchMetricsCollector } from './observability/search-metrics';
import { SearchStatisticsService } from './observability/search-statistics';
import { SearchHealthIndicator } from './observability/search-health-indicator';
import { InMemorySearchAdapter } from './adapters/in-memory-search.adapter';
import type { SearchProvider } from './search-provider.interface';
import type { SearchModuleOptions, SearchProviderConfig } from './types';

@Global()
@Module({})
export class SearchModule {
  static forRoot(options: SearchModuleOptions): DynamicModule {
    const provider = SearchModule.createProviderConfig(options);

    const commonProviders: Provider[] = [
      SearchClient,
      SearchRegistry,
      SearchIndexManager,
      DocumentMapper,
      BulkIndexer,
      SearchQueryCompiler,
      SearchResultMapper,
      SearchMetricsCollector,
      SearchStatisticsService,
      SearchHealthIndicator,
      { provide: SEARCH_CLIENT, useExisting: SearchClient },
      { provide: SEARCH_REGISTRY, useExisting: SearchRegistry },
      { provide: SEARCH_INDEX_MANAGER, useExisting: SearchIndexManager },
      { provide: SEARCH_DOCUMENT_MAPPER, useExisting: DocumentMapper },
      { provide: SEARCH_BULK_INDEXER, useExisting: BulkIndexer },
      { provide: SEARCH_QUERY_COMPILER, useExisting: SearchQueryCompiler },
      { provide: SEARCH_RESULT_MAPPER, useExisting: SearchResultMapper },
      { provide: SEARCH_METRICS_COLLECTOR, useExisting: SearchMetricsCollector },
      { provide: SEARCH_STATISTICS_SERVICE, useExisting: SearchStatisticsService },
      { provide: SEARCH_HEALTH_INDICATOR, useExisting: SearchHealthIndicator },
    ];

    const commonExports = [
      SEARCH_CLIENT, SEARCH_REGISTRY, SEARCH_INDEX_MANAGER,
      SEARCH_DOCUMENT_MAPPER, SEARCH_BULK_INDEXER,
      SEARCH_QUERY_COMPILER, SEARCH_RESULT_MAPPER,
      SEARCH_METRICS_COLLECTOR, SEARCH_STATISTICS_SERVICE, SEARCH_HEALTH_INDICATOR,
      SearchClient, SearchRegistry, SearchIndexManager,
      DocumentMapper, BulkIndexer,
      SearchQueryCompiler, SearchResultMapper,
      SearchMetricsCollector, SearchStatisticsService, SearchHealthIndicator,
    ];

    return {
      module: SearchModule,
      providers: [
        { provide: SEARCH_MODULE_OPTIONS, useValue: options },
        provider,
        ...commonProviders,
      ],
      exports: commonExports,
    };
  }

  static forRootAsync(asyncOptions: {
    useFactory: (...args: unknown[]) => SearchModuleOptions | Promise<SearchModuleOptions>;
    inject?: unknown[];
    extraProviders?: Provider[];
  }): DynamicModule {
    const commonProviders: Provider[] = [
      SearchClient,
      SearchRegistry,
      SearchIndexManager,
      DocumentMapper,
      BulkIndexer,
      SearchQueryCompiler,
      SearchResultMapper,
      SearchMetricsCollector,
      SearchStatisticsService,
      SearchHealthIndicator,
      { provide: SEARCH_CLIENT, useExisting: SearchClient },
      { provide: SEARCH_REGISTRY, useExisting: SearchRegistry },
      { provide: SEARCH_INDEX_MANAGER, useExisting: SearchIndexManager },
      { provide: SEARCH_DOCUMENT_MAPPER, useExisting: DocumentMapper },
      { provide: SEARCH_BULK_INDEXER, useExisting: BulkIndexer },
      { provide: SEARCH_QUERY_COMPILER, useExisting: SearchQueryCompiler },
      { provide: SEARCH_RESULT_MAPPER, useExisting: SearchResultMapper },
      { provide: SEARCH_METRICS_COLLECTOR, useExisting: SearchMetricsCollector },
      { provide: SEARCH_STATISTICS_SERVICE, useExisting: SearchStatisticsService },
      { provide: SEARCH_HEALTH_INDICATOR, useExisting: SearchHealthIndicator },
    ];

    const commonExports = [
      SEARCH_CLIENT, SEARCH_REGISTRY, SEARCH_INDEX_MANAGER,
      SEARCH_DOCUMENT_MAPPER, SEARCH_BULK_INDEXER,
      SEARCH_QUERY_COMPILER, SEARCH_RESULT_MAPPER,
      SEARCH_METRICS_COLLECTOR, SEARCH_STATISTICS_SERVICE, SEARCH_HEALTH_INDICATOR,
      SearchClient, SearchRegistry, SearchIndexManager,
      DocumentMapper, BulkIndexer,
      SearchQueryCompiler, SearchResultMapper,
      SearchMetricsCollector, SearchStatisticsService, SearchHealthIndicator,
    ];

    const providers: Provider[] = [
      {
        provide: SEARCH_MODULE_OPTIONS,
        useFactory: asyncOptions.useFactory,
        inject: asyncOptions.inject ?? [],
      },
      {
        provide: SEARCH_PROVIDER,
        useFactory: async (opts: SearchModuleOptions) => {
          const config = opts.defaultProvider
            ? opts.providers.find(p => p.name === opts.defaultProvider)
            : opts.providers[0];

          if (!config) throw new Error('No search provider configured');

          const adapter = SearchModule.createAdapter(config);
          await adapter.connect();
          return adapter;
        },
        inject: [SEARCH_MODULE_OPTIONS],
      },
      ...commonProviders,
      ...(asyncOptions.extraProviders ?? []),
    ];

    return {
      module: SearchModule,
      providers,
      exports: commonExports,
    };
  }

  private static createProviderConfig(options: SearchModuleOptions): Provider {
    return {
      provide: SEARCH_PROVIDER,
      useFactory: async () => {
        const config = options.defaultProvider
          ? options.providers.find(p => p.name === options.defaultProvider)
          : options.providers[0];

        if (!config) throw new Error('No search provider configured');

        const adapter = SearchModule.createAdapter(config);
        await adapter.connect();
        return adapter;
      },
    };
  }

  static createAdapter(config: SearchProviderConfig): SearchProvider {
    switch (config.type ?? 'memory') {
      case 'memory':
        return new InMemorySearchAdapter(config.name);
      case 'opensearch':
        throw new Error('OpenSearch adapter not yet implemented');
      case 'elasticsearch':
        throw new Error('Elasticsearch adapter not yet implemented');
      default:
        throw new Error(`Unknown search provider type: ${config.type}`);
    }
  }
}
