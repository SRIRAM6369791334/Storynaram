export { SearchModule } from './search.module.js';
export { SearchClient } from './search-client.js';
export { SearchRegistry } from './search-registry.js';
export { SearchIndexManager } from './search-index-manager.js';
export { DocumentMapper } from './document-mapper.js';
export { BulkIndexer } from './bulk-indexer.js';
export { SearchQueryCompiler } from './search-query-compiler.js';
export { SearchResultMapper } from './search-result-mapper.js';
export { InMemorySearchAdapter } from './adapters/in-memory-search.adapter.js';
export { SearchMetricsCollector } from './observability/search-metrics.js';
export { SearchStatisticsService } from './observability/search-statistics.js';
export { SearchHealthIndicator } from './observability/search-health-indicator.js';
export type { SearchProvider } from './search-provider.interface.js';

export * from './tokens.js';
export * from './types.js';
export * from './errors.js';

export {
  SEARCH_MODULE_OPTIONS, SEARCH_PROVIDER, SEARCH_CLIENT, SEARCH_REGISTRY,
  SEARCH_INDEX_MANAGER, SEARCH_DOCUMENT_MAPPER, SEARCH_BULK_INDEXER,
  SEARCH_QUERY_COMPILER, SEARCH_RESULT_MAPPER,
  SEARCH_HEALTH_INDICATOR, SEARCH_METRICS_COLLECTOR, SEARCH_STATISTICS_SERVICE,
} from './tokens.js';
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
} from './types.js';
export {
  SearchError, IndexNotFoundError, IndexAlreadyExistsError,
  DocumentNotFoundError, BulkOperationError, SearchTimeoutError,
  InvalidQueryError, ClusterUnavailableError, ProviderNotFoundError,
  ReindexError, TemplateNotFoundError,
} from './errors.js';
export type { SearchHealthResult } from './observability/search-health-indicator.js';
export type { SearchStatisticsResult } from './observability/search-statistics.js';
export type { SearchMetricsData } from './observability/search-metrics.js';
