import type {
  SearchIndexConfig, IndexTemplate, IndexAlias,
  SearchDocument, BulkOperation, BulkResponse,
  SearchQuery, SearchResult, AutocompleteQuery, FacetResult,
  ClusterHealthResponse, IndexStatsResponse,
  ReindexOptions,
} from './types';

export interface SearchProvider {
  readonly name: string;

  connect(): Promise<void>;
  close(): Promise<void>;
  ping(): Promise<boolean>;

  indexExists(index: string): Promise<boolean>;
  createIndex(config: SearchIndexConfig): Promise<void>;
  deleteIndex(index: string): Promise<void>;
  getIndexConfig(index: string): Promise<SearchIndexConfig>;
  listIndices(): Promise<string[]>;

  putIndexTemplate(template: IndexTemplate): Promise<void>;
  deleteIndexTemplate(name: string): Promise<void>;
  getIndexTemplate(name: string): Promise<IndexTemplate>;
  listIndexTemplates(): Promise<string[]>;

  putAlias(alias: IndexAlias): Promise<void>;
  deleteAlias(alias: string, index?: string): Promise<void>;
  getAliases(index?: string): Promise<IndexAlias[]>;
  updateAliases(actions: AliasAction[]): Promise<void>;

  index(document: SearchDocument): Promise<void>;
  update(document: SearchDocument): Promise<void>;
  delete(index: string, id: string): Promise<void>;
  get(index: string, id: string): Promise<SearchDocument | null>;
  exists(index: string, id: string): Promise<boolean>;

  bulk(operations: BulkOperation[]): Promise<BulkResponse>;

  search(query: SearchQuery): Promise<SearchResult>;
  autocomplete(query: AutocompleteQuery): Promise<string[]>;
  facets(index: string, field: string, prefix?: string, size?: number): Promise<FacetResult>;

  refreshIndex(index: string): Promise<void>;
  flushIndex(index: string): Promise<void>;

  clusterHealth(): Promise<ClusterHealthResponse>;
  indexStats(index?: string): Promise<IndexStatsResponse | Record<string, IndexStatsResponse>>;

  reindex(options: ReindexOptions): Promise<BulkResponse>;

  count(index: string, query?: { query: QueryClause }): Promise<number>;
}

export interface AliasAction {
  add?: IndexAlias;
  remove?: { alias: string; index?: string };
  removeIndex?: { index: string };
}

type QueryClause = import('./types').QueryClause;
