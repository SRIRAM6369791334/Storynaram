export interface SearchIndexConfig {
  name: string;
  settings?: IndexSettings;
  mappings?: Record<string, unknown>;
  aliases?: string[];
}

export interface IndexSettings {
  numberOfShards?: number;
  numberOfReplicas?: number;
  refreshInterval?: string;
  analysis?: {
    analyzer?: Record<string, AnalyzerConfig>;
    filter?: Record<string, unknown>;
    tokenizer?: Record<string, unknown>;
    normalizer?: Record<string, unknown>;
  };
}

export interface AnalyzerConfig {
  type: string;
  tokenizer?: string;
  filter?: string[];
  charFilter?: string[];
}

export interface IndexTemplate {
  name: string;
  indexPatterns: string[];
  template: {
    settings?: IndexSettings;
    mappings?: Record<string, unknown>;
    aliases?: Record<string, unknown>;
  };
  priority?: number;
}

export interface IndexAlias {
  name: string;
  index: string;
  filter?: Record<string, unknown>;
  routing?: string;
  isWriteIndex?: boolean;
}

export interface SearchDocument {
  id: string;
  index: string;
  body: Record<string, unknown>;
}

export interface BulkOperation {
  action: 'index' | 'update' | 'delete' | 'create';
  index: string;
  id: string;
  document?: Record<string, unknown>;
}

export interface SearchQuery {
  index: string;
  query: QueryClause;
  from?: number;
  size?: number;
  sort?: SortClause[];
  source?: string[] | boolean;
  aggregations?: Record<string, AggregationClause>;
  highlight?: HighlightConfig;
  suggest?: SuggestConfig;
  searchAfter?: unknown[];
  trackTotalHits?: boolean | number;
  timeout?: string;
}

export type QueryClause =
  | MatchAllQuery
  | MatchQuery
  | TermQuery
  | TermsQuery
  | RangeQuery
  | BoolQuery
  | PrefixQuery
  | WildcardQuery
  | FuzzyQuery
  | MultiMatchQuery
  | NestedQuery
  | ExistsQuery
  | GeoDistanceQuery
  | GeoBoundingBoxQuery
  | ScriptQuery
  | FunctionScoreQuery
  | DisMaxQuery
  | ConstantScoreQuery
  | BoostingQuery;

export interface MatchAllQuery { match_all: Record<string, never> | { boost?: number }; }
export interface MatchQuery { match: Record<string, { query: string; fuzziness?: string; operator?: string; minimumShouldMatch?: string; boost?: number }>; }
export interface TermQuery { term: Record<string, string | number | boolean | { value: string | number | boolean; boost?: number }>; }
export interface TermsQuery { terms: Record<string, (string | number)[]>; }
export interface RangeQuery { range: Record<string, { gte?: number | string; lte?: number | string; gt?: number | string; lt?: number | string; format?: string; boost?: number }>; }
export interface BoolQuery { bool: { must?: QueryClause[]; should?: QueryClause[]; filter?: QueryClause[]; mustNot?: QueryClause[]; minimumShouldMatch?: number; boost?: number }; }
export interface PrefixQuery { prefix: Record<string, { value: string; boost?: number }>; }
export interface WildcardQuery { wildcard: Record<string, { value: string; boost?: number }>; }
export interface FuzzyQuery { fuzzy: Record<string, { value: string; fuzziness?: string; prefixLength?: number; maxExpansions?: number }>; }
export interface MultiMatchQuery { multi_match: { query: string; fields: string[]; type?: 'best_fields' | 'most_fields' | 'cross_fields' | 'phrase' | 'phrase_prefix' | 'bool_prefix'; operator?: string; fuzziness?: string; minimumShouldMatch?: string; tieBreaker?: number }; }
export interface NestedQuery { nested: { path: string; query: QueryClause; scoreMode?: 'avg' | 'sum' | 'min' | 'max' | 'none' }; }
export interface ExistsQuery { exists: { field: string }; }
export interface GeoDistanceQuery { geo_distance: { distance: string; field: string; location: GeoPoint }; }
export interface GeoBoundingBoxQuery { geo_bounding_box: Record<string, { topLeft: GeoPoint; bottomRight: GeoPoint }>; }
export interface ScriptQuery { script: { script: { source: string; lang?: string; params?: Record<string, unknown> } }; }
export interface FunctionScoreQuery { function_score: { query: QueryClause; functions: ScoreFunction[]; scoreMode?: 'multiply' | 'sum' | 'avg' | 'first' | 'max' | 'min'; boostMode?: 'multiply' | 'sum' | 'avg' | 'first' | 'max' | 'min' | 'replace' }; }
export interface DisMaxQuery { dis_max: { queries: QueryClause[]; tieBreaker?: number; boost?: number }; }
export interface ConstantScoreQuery { constant_score: { filter: QueryClause; boost?: number }; }
export interface BoostingQuery { boosting: { positive: QueryClause; negative: QueryClause; negativeBoost: number }; }

export interface ScoreFunction {
  filter?: QueryClause;
  weight?: number;
  script_score?: { script: { source: string; params?: Record<string, unknown> } };
  random_score?: { seed?: number; field?: string };
  field_value_factor?: { field: string; factor?: number; modifier?: 'none' | 'log' | 'log1p' | 'log2p' | 'ln' | 'ln1p' | 'ln2p' | 'square' | 'sqrt' | 'reciprocal'; missing?: number };
}

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface SortClause {
  field: string;
  order?: 'asc' | 'desc';
  mode?: 'min' | 'max' | 'avg' | 'sum';
  missing?: '_last' | '_first' | number;
  unmappedType?: string;
}

export interface HighlightConfig {
  fields: string[];
  preTags?: string[];
  postTags?: string[];
  fragmentSize?: number;
  numberOfFragments?: number;
  requireFieldMatch?: boolean;
  type?: 'plain' | 'fvh' | 'unified';
}

export interface SuggestConfig {
  text: string;
  suggestions: Record<string, Suggester>;
}

export interface Suggester {
  prefix?: string;
  regex?: string;
  completion?: { field: string; size?: number; skipDuplicates?: boolean; fuzzy?: { fuzziness?: string; prefixLength?: number } };
  term?: { field: string; size?: number; suggestMode?: 'missing' | 'popular' | 'always' };
  phrase?: { field: string; size?: number; gramSize?: number; directGenerator?: { field: string; suggestMode?: string; minWordLength?: number }[] };
}

export interface AggregationClause {
  terms?: { field: string; size?: number; order?: Record<string, string>; minDocCount?: number; missing?: string };
  avg?: { field: string; missing?: number };
  sum?: { field: string; missing?: number };
  min?: { field: string };
  max?: { field: string };
  stats?: { field: string };
  extendedStats?: { field: string; sigma?: number };
  cardinality?: { field: string; precisionThreshold?: number };
  dateHistogram?: { field: string; fixedInterval?: string; calendarInterval?: string; format?: string; minDocCount?: number; extendedBounds?: { min: string; max: string } };
  range?: { field: string; ranges: { from?: number; to?: number; key?: string }[] };
  histogram?: { field: string; interval: number; minDocCount?: number; extendedBounds?: { min: number; max: number } };
  geoDistance?: { field: string; origin: GeoPoint; ranges: { from?: number; to?: number; key?: string }[] };
  filters?: { filters: Record<string, QueryClause> };
  nested?: { path: string };
  reverseNested?: Record<string, never>;
  topHits?: { size?: number; sort?: SortClause[]; source?: string[] | boolean };
  scriptedMetric?: { initScript?: string; mapScript?: string; combineScript?: string; reduceScript?: string };
  aggs?: Record<string, AggregationClause>;
}

export interface SearchResult {
  took: number;
  total: number;
  maxScore: number;
  hits: SearchHit[];
  aggregations?: Record<string, AggregationResult>;
  suggests?: Record<string, SuggestResult[]>;
  timedOut: boolean;
  shards: ShardStats;
}

export interface SearchHit {
  id: string;
  index: string;
  score: number;
  source: Record<string, unknown>;
  highlight?: Record<string, string[]>;
  sort?: unknown[];
  innerHits?: Record<string, { hits: SearchHit[] }>;
  matchedQueries?: string[];
  explanation?: Record<string, unknown>;
}

export interface AggregationResult {
  value?: number;
  values?: Record<string, number>;
  buckets?: AggregationBucket[];
  sumOtherDocCount?: number;
  docCountErrorUpperBound?: number;
  hits?: { hits: SearchHit[] };
  meta?: Record<string, unknown>;
}

export interface AggregationBucket {
  key: string | number;
  keyAsString?: string;
  docCount: number;
  from?: number;
  to?: number;
  fromAsString?: string;
  toAsString?: string;
  aggResult?: Record<string, AggregationResult>;
}

export interface SuggestResult {
  text: string;
  offset: number;
  length: number;
  options: { text: string; score: number; collateMatch?: boolean }[];
}

export interface ShardStats {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
}

export interface AutocompleteQuery {
  index: string;
  field: string;
  prefix: string;
  size?: number;
  fuzzy?: { fuzziness?: string; prefixLength?: number };
}

export interface FacetResult {
  field: string;
  total: number;
  other: number;
  missing: number;
  buckets: { value: string; count: number; selected?: boolean }[];
}

export interface ClusterHealthResponse {
  status: 'green' | 'yellow' | 'red';
  name: string;
  clusterName: string;
  nodeCount: number;
  dataNodeCount: number;
  activePrimaryShards: number;
  activeShards: number;
  relocatingShards: number;
  initializingShards: number;
  unassignedShards: number;
  pendingTasks: number;
  timedOut: boolean;
  numberOfNodes: number;
  numberOfDataNodes: number;
  activeShardsPercent: number;
  indices?: Record<string, IndexHealthResponse>;
}

export interface IndexHealthResponse {
  status: 'green' | 'yellow' | 'red';
  numberOfShards: number;
  numberOfReplicas: number;
  activePrimaryShards: number;
  activeShards: number;
  relocatingShards: number;
  initializingShards: number;
  unassignedShards: number;
  health: string;
}

export interface IndexStatsResponse {
  index: string;
  docCount: number;
  deletedDocCount: number;
  sizeInBytes: number;
  primarySizeInBytes: number;
  segmentCount: number;
}

export interface BulkResponse {
  took: number;
  errors: boolean;
  items: BulkResponseItem[];
}

export interface BulkResponseItem {
  index?: { _index: string; _id: string; _version: number; result: string; status: number; error?: { type: string; reason: string } };
  create?: { _index: string; _id: string; _version: number; result: string; status: number; error?: { type: string; reason: string } };
  update?: { _index: string; _id: string; _version: number; result: string; status: number; error?: { type: string; reason: string } };
  delete?: { _index: string; _id: string; _version: number; result: string; status: number; error?: { type: string; reason: string } };
}

export interface ReindexOptions {
  source: { index: string; query?: QueryClause; size?: number };
  dest: { index: string; pipeline?: string };
  conflicts?: 'abort' | 'proceed';
  script?: { source: string; lang?: string };
  size?: number;
  slices?: number | 'auto';
  refresh?: boolean;
  waitForCompletion?: boolean;
  requestsPerSecond?: number;
}

export interface SearchProviderConfig {
  name: string;
  type?: 'memory' | 'opensearch' | 'elasticsearch';
  node?: string;
  maxRetries?: number;
  requestTimeout?: number;
  pingTimeout?: number;
  sniffOnStart?: boolean;
  sniffInterval?: number;
  ssl?: {
    rejectUnauthorized?: boolean;
    ca?: string;
    cert?: string;
    key?: string;
  };
  auth?: {
    username?: string;
    password?: string;
    apiKey?: string;
  };
  headers?: Record<string, string>;
}

export interface SearchModuleOptions {
  providers: SearchProviderConfig[];
  defaultProvider: string;
}
