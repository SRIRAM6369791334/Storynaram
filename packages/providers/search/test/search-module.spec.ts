import { describe, it, expect } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { SearchModule } from '../src/search.module';
import {
  SEARCH_CLIENT, SEARCH_REGISTRY, SEARCH_INDEX_MANAGER,
  SEARCH_DOCUMENT_MAPPER, SEARCH_BULK_INDEXER,
  SEARCH_QUERY_COMPILER, SEARCH_RESULT_MAPPER,
  SEARCH_HEALTH_INDICATOR, SEARCH_METRICS_COLLECTOR, SEARCH_STATISTICS_SERVICE,
} from '../src/tokens';
import { SearchClient } from '../src/search-client';
import { SearchRegistry } from '../src/search-registry';
import { SearchIndexManager } from '../src/search-index-manager';
import { DocumentMapper } from '../src/document-mapper';
import { BulkIndexer } from '../src/bulk-indexer';
import { SearchQueryCompiler } from '../src/search-query-compiler';
import { SearchResultMapper } from '../src/search-result-mapper';
import { SearchMetricsCollector } from '../src/observability/search-metrics';
import { SearchStatisticsService } from '../src/observability/search-statistics';
import { SearchHealthIndicator } from '../src/observability/search-health-indicator';

describe('SearchModule', () => {
  it('forRoot creates a working module with in-memory provider', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        SearchModule.forRoot({
          providers: [{ name: 'default', type: 'memory' }],
          defaultProvider: 'default',
        }),
      ],
    }).compile();

    const client = moduleRef.get<SearchClient>(SEARCH_CLIENT);
    expect(client).toBeDefined();
    expect(client.providerName).toBe('default');

    const registry = moduleRef.get<SearchRegistry>(SEARCH_REGISTRY);
    expect(registry).toBeDefined();

    const indexManager = moduleRef.get<SearchIndexManager>(SEARCH_INDEX_MANAGER);
    expect(indexManager).toBeDefined();
    await indexManager.create({ name: 'module-test' });
    expect(await indexManager.exists('module-test')).toBe(true);

    const docMapper = moduleRef.get<DocumentMapper>(SEARCH_DOCUMENT_MAPPER);
    expect(docMapper).toBeDefined();

    const bulkIndexer = moduleRef.get<BulkIndexer>(SEARCH_BULK_INDEXER);
    expect(bulkIndexer).toBeDefined();

    const queryCompiler = moduleRef.get<SearchQueryCompiler>(SEARCH_QUERY_COMPILER);
    expect(queryCompiler).toBeDefined();

    const resultMapper = moduleRef.get<SearchResultMapper>(SEARCH_RESULT_MAPPER);
    expect(resultMapper).toBeDefined();

    const metrics = moduleRef.get<SearchMetricsCollector>(SEARCH_METRICS_COLLECTOR);
    expect(metrics).toBeDefined();

    const statistics = moduleRef.get<SearchStatisticsService>(SEARCH_STATISTICS_SERVICE);
    expect(statistics).toBeDefined();

    const health = moduleRef.get<SearchHealthIndicator>(SEARCH_HEALTH_INDICATOR);
    expect(health).toBeDefined();
  });

  it('forRoot configures module with async setup', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        SearchModule.forRootAsync({
          useFactory: () => ({
            providers: [{ name: 'async-provider', type: 'memory' }],
            defaultProvider: 'async-provider',
          }),
          inject: [],
        }),
      ],
    }).compile();

    const client = moduleRef.get<SearchClient>(SEARCH_CLIENT);
    expect(client.providerName).toBe('async-provider');
  });

  it('forRoot with multiple providers', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        SearchModule.forRoot({
          providers: [
            { name: 'primary', type: 'memory' },
            { name: 'secondary', type: 'memory' },
          ],
          defaultProvider: 'primary',
        }),
      ],
    }).compile();

    const registry = moduleRef.get<SearchRegistry>(SEARCH_REGISTRY);
    expect(registry.getAllProviders()).toHaveLength(0);
  });
});
