export { SearchModule } from './search.module';
export { SearchClient } from './search-client';
export { SearchRegistry } from './search-registry';
export { SearchIndexManager } from './search-index-manager';
export { DocumentMapper } from './document-mapper';
export { BulkIndexer } from './bulk-indexer';
export { SearchQueryCompiler } from './search-query-compiler';
export { SearchResultMapper } from './search-result-mapper';
export { InMemorySearchAdapter } from './adapters/in-memory-search.adapter';
export { SearchMetricsCollector } from './observability/search-metrics';
export { SearchStatisticsService } from './observability/search-statistics';
export { SearchHealthIndicator } from './observability/search-health-indicator';
export type { SearchProvider } from './search-provider.interface';

export * from './tokens';
export * from './types';
export * from './errors';

export {
  SEARCH_MODULE_OPTIONS, SEARCH_PROVIDER, SEARCH_CLIENT, SEARCH_REGISTRY,
  SEARCH_INDEX_MANAGER, SEARCH_DOCUMENT_MAPPER, SEARCH_BULK_INDEXER,
  SEARCH_QUERY_COMPILER, SEARCH_RESULT_MAPPER,
  SEARCH_HEALTH_INDICATOR, SEARCH_METRICS_COLLECTOR, SEARCH_STATISTICS_SERVICE,
} from './tokens';
export type {
  SearchIndexConfig, IndexSettings, IndexTemplate, IndexAlias,
  SearchDocument, BulkOperation, BulkResponse, BulkResponseItem,
  SearchQuery, SearchResult, SearchHit, AutocompleteQuery, FacetResult,
  ClusterHealthResponse, IndexStatsResponse,
  QueryClause, AggregationClause, AggregationResult, AggregationBucket,
  SortClause, HighlightConfig, SuggestConfig, Suggester,
  SearchProviderConfig, SearchModuleOptions,
  ReindexOptions, ShardStats, ScoreFunction, GeoPoint,
  AnalyzerConfig,
} from './types';
export {
  SearchError, IndexNotFoundError, IndexAlreadyExistsError,
  DocumentNotFoundError, BulkOperationError, SearchTimeoutError,
  InvalidQueryError, ClusterUnavailableError, ProviderNotFoundError,
  ReindexError, TemplateNotFoundError,
} from './errors';
export type { SearchHealthResult } from './observability/search-health-indicator';
export type { SearchStatisticsResult } from './observability/search-statistics';
export type { SearchMetricsData } from './observability/search-metrics';
