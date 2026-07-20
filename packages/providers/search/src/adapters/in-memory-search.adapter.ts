import { Injectable, Logger } from '@nestjs/common';
import type { SearchProvider, AliasAction } from '../search-provider.interface';
import type {
  SearchIndexConfig, IndexTemplate, IndexAlias,
  SearchDocument, BulkOperation, BulkResponse, BulkResponseItem,
  SearchQuery, SearchResult, SearchHit, AutocompleteQuery, FacetResult,
  ClusterHealthResponse, IndexStatsResponse, ShardStats,
  QueryClause, ReindexOptions, AggregationClause, AggregationResult, AggregationBucket,
} from '../types';
import {
  IndexNotFoundError, IndexAlreadyExistsError, DocumentNotFoundError,
  ClusterUnavailableError, InvalidQueryError,
} from '../errors';
import { SearchQueryCompiler, CompiledSearchQuery } from '../search-query-compiler';

interface IndexState {
  config: SearchIndexConfig;
  documents: Map<string, Record<string, unknown>>;
  aliases: string[];
}

@Injectable()
export class InMemorySearchAdapter implements SearchProvider {
  readonly name: string;
  private readonly logger = new Logger(InMemorySearchAdapter.name);
  private indices = new Map<string, IndexState>();
  private templates = new Map<string, IndexTemplate>();
  private connected = false;
  private readonly queryCompiler = new SearchQueryCompiler();

  constructor(name: string) {
    this.name = name;
  }

  async connect(): Promise<void> {
    this.connected = true;
    this.logger.log(`InMemory search provider ${this.name} ready`);
  }

  async close(): Promise<void> {
    this.indices.clear();
    this.templates.clear();
    this.connected = false;
    this.logger.log(`InMemory search provider ${this.name} closed`);
  }

  async ping(): Promise<boolean> {
    return this.connected;
  }

  async indexExists(index: string): Promise<boolean> {
    this.ensureConnected();
    return this.indices.has(index);
  }

  async createIndex(config: SearchIndexConfig): Promise<void> {
    this.ensureConnected();
    if (this.indices.has(config.name)) {
      throw new IndexAlreadyExistsError(config.name);
    }
    this.indices.set(config.name, {
      config,
      documents: new Map(),
      aliases: config.aliases ?? [],
    });
  }

  async deleteIndex(index: string): Promise<void> {
    this.ensureConnected();
    if (!this.indices.has(index)) throw new IndexNotFoundError(index);
    this.indices.delete(index);
  }

  async getIndexConfig(index: string): Promise<SearchIndexConfig> {
    this.ensureConnected();
    const state = this.indices.get(index);
    if (!state) throw new IndexNotFoundError(index);
    return state.config;
  }

  async listIndices(): Promise<string[]> {
    this.ensureConnected();
    return Array.from(this.indices.keys());
  }

  async putIndexTemplate(template: IndexTemplate): Promise<void> {
    this.ensureConnected();
    this.templates.set(template.name, template);
  }

  async deleteIndexTemplate(name: string): Promise<void> {
    this.ensureConnected();
    if (!this.templates.has(name)) return;
    this.templates.delete(name);
  }

  async getIndexTemplate(name: string): Promise<IndexTemplate> {
    this.ensureConnected();
    const tpl = this.templates.get(name);
    if (!tpl) throw new Error(`Template not found: ${name}`);
    return tpl;
  }

  async listIndexTemplates(): Promise<string[]> {
    this.ensureConnected();
    return Array.from(this.templates.keys());
  }

  async putAlias(alias: IndexAlias): Promise<void> {
    this.ensureConnected();
    const state = this.indices.get(alias.index);
    if (!state) throw new IndexNotFoundError(alias.index);
    if (!state.aliases.includes(alias.name)) {
      state.aliases.push(alias.name);
    }
  }

  async deleteAlias(alias: string, index?: string): Promise<void> {
    this.ensureConnected();
    if (index) {
      const state = this.indices.get(index);
      if (state) {
        state.aliases = state.aliases.filter(a => a !== alias);
      }
    } else {
      for (const state of this.indices.values()) {
        state.aliases = state.aliases.filter(a => a !== alias);
      }
    }
  }

  async getAliases(index?: string): Promise<IndexAlias[]> {
    this.ensureConnected();
    const result: IndexAlias[] = [];
    if (index) {
      const state = this.indices.get(index);
      if (state) {
        for (const alias of state.aliases) {
          result.push({ name: alias, index });
        }
      }
    } else {
      for (const [idx, state] of this.indices) {
        for (const alias of state.aliases) {
          result.push({ name: alias, index: idx });
        }
      }
    }
    return result;
  }

  async updateAliases(actions: AliasAction[]): Promise<void> {
    this.ensureConnected();
    for (const action of actions) {
      if (action.add) {
        await this.putAlias(action.add);
      }
      if (action.remove) {
        await this.deleteAlias(action.remove.alias, action.remove.index);
      }
      if (action.removeIndex && this.indices.has(action.removeIndex.index)) {
        this.indices.delete(action.removeIndex.index);
      }
    }
  }

  async index(document: SearchDocument): Promise<void> {
    this.ensureConnected();
    const state = this.getIndexState(document.index);
    state.documents.set(document.id, { ...document.body });
  }

  async update(document: SearchDocument): Promise<void> {
    this.ensureConnected();
    const state = this.getIndexState(document.index);
    const existing = state.documents.get(document.id);
    if (!existing) throw new DocumentNotFoundError(document.index, document.id);
    state.documents.set(document.id, { ...existing, ...document.body });
  }

  async delete(index: string, id: string): Promise<void> {
    this.ensureConnected();
    const state = this.getIndexState(index);
    if (!state.documents.has(id)) throw new DocumentNotFoundError(index, id);
    state.documents.delete(id);
  }

  async get(index: string, id: string): Promise<SearchDocument | null> {
    this.ensureConnected();
    const state = this.indices.get(index);
    if (!state) return null;
    const body = state.documents.get(id);
    if (!body) return null;
    return { index, id, body };
  }

  async exists(index: string, id: string): Promise<boolean> {
    this.ensureConnected();
    const state = this.indices.get(index);
    if (!state) return false;
    return state.documents.has(id);
  }

  async bulk(operations: BulkOperation[]): Promise<BulkResponse> {
    this.ensureConnected();
    const items: BulkResponseItem[] = [];
    let errors = false;

    for (const op of operations) {
      try {
        const item: BulkResponseItem = { [op.action]: { _index: op.index, _id: op.id, _version: 1, result: 'created', status: 201 } };

        switch (op.action) {
          case 'index':
          case 'create':
            await this.index({ index: op.index, id: op.id, body: op.document ?? {} });
            break;
          case 'update':
            await this.update({ index: op.index, id: op.id, body: op.document ?? {} });
            item[op.action]!.result = 'updated';
            break;
          case 'delete':
            try {
              await this.delete(op.index, op.id);
              item[op.action]!.result = 'deleted';
              item[op.action]!.status = 200;
            } catch {
              item[op.action]!.result = 'not_found';
              item[op.action]!.status = 404;
            }
            break;
        }

        items.push(item);
      } catch (err) {
        errors = true;
        items.push({
          [op.action]: {
            _index: op.index,
            _id: op.id,
            _version: 0,
            result: 'noop',
            status: 500,
            error: { type: 'exception', reason: (err as Error).message },
          },
        } as BulkResponseItem);
      }
    }

    return { took: 0, errors, items };
  }

  async search(query: SearchQuery): Promise<SearchResult> {
    this.ensureConnected();
    const start = Date.now();
    const state = this.getIndexState(query.index);
    const compiled = this.queryCompiler.compile(query);
    const allDocs = Array.from(state.documents.entries());
    const from = query.from ?? 0;
    const size = query.size ?? 20;

    let hits = allDocs
      .filter(([, body]) => this.matchesQuery(body, query.query))
      .map(([id, body], i) => ({
        id,
        index: query.index,
        score: 1 / (i + 1),
        source: body,
      } as SearchHit));

    if (query.sort) {
      hits = this.applySort(hits, query.sort);
    }

    const total = hits.length;

    if (query.aggregations) {
      const aggs = this.computeAggregations(hits, query.aggregations);
      return {
        took: Date.now() - start,
        total,
        maxScore: hits.length > 0 ? hits[0].score : 0,
        hits: hits.slice(from, from + size),
        aggregations: aggs,
        timedOut: false,
        shards: { total: 1, successful: 1, failed: 0, skipped: 0 },
      };
    }

    return {
      took: Date.now() - start,
      total,
      maxScore: hits.length > 0 ? hits[0].score : 0,
      hits: hits.slice(from, from + size),
      timedOut: false,
      shards: { total: 1, successful: 1, failed: 0, skipped: 0 },
    };
  }

  async autocomplete(query: AutocompleteQuery): Promise<string[]> {
    this.ensureConnected();
    const state = this.getIndexState(query.index);
    const prefix = query.prefix.toLowerCase();
    const size = query.size ?? 10;
    const suggestions = new Set<string>();

    for (const body of state.documents.values()) {
      const value = this.getNestedValue(body, query.field);
      if (value == null) continue;

      const values = Array.isArray(value) ? value : [value];
      for (const v of values) {
        const str = String(v).toLowerCase();
        if (str.startsWith(prefix)) {
          suggestions.add(String(v));
          if (suggestions.size >= size) break;
        }
      }
      if (suggestions.size >= size) break;
    }

    return Array.from(suggestions);
  }

  async facets(index: string, field: string, _prefix?: string, size?: number): Promise<FacetResult> {
    this.ensureConnected();
    const state = this.getIndexState(index);
    const counts = new Map<string, number>();

    for (const body of state.documents.values()) {
      const value = this.getNestedValue(body, field);
      if (value == null) continue;
      const key = String(value);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const buckets = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, size ?? 10)
      .map(([value, count]) => ({ value, count }));

    const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);

    return { field, total, other: 0, missing: 0, buckets };
  }

  async refreshIndex(_index: string): Promise<void> {
    // no-op for in-memory
  }

  async flushIndex(_index: string): Promise<void> {
    // no-op for in-memory
  }

  async clusterHealth(): Promise<ClusterHealthResponse> {
    this.ensureConnected();
    return {
      status: 'green',
      name: this.name,
      clusterName: 'in-memory',
      nodeCount: 1,
      dataNodeCount: 1,
      activePrimaryShards: this.indices.size,
      activeShards: this.indices.size,
      relocatingShards: 0,
      initializingShards: 0,
      unassignedShards: 0,
      pendingTasks: 0,
      timedOut: false,
      numberOfNodes: 1,
      numberOfDataNodes: 1,
      activeShardsPercent: 100,
    };
  }

  async indexStats(index?: string): Promise<IndexStatsResponse | Record<string, IndexStatsResponse>> {
    this.ensureConnected();
    if (index) {
      const state = this.getIndexState(index);
      const docCount = state.documents.size;
      return { index, docCount, deletedDocCount: 0, sizeInBytes: docCount * 1024, primarySizeInBytes: docCount * 1024, segmentCount: 1 };
    }
    const result: Record<string, IndexStatsResponse> = {};
    for (const [idx, state] of this.indices) {
      const docCount = state.documents.size;
      result[idx] = { index: idx, docCount, deletedDocCount: 0, sizeInBytes: docCount * 1024, primarySizeInBytes: docCount * 1024, segmentCount: 1 };
    }
    return result;
  }

  async reindex(options: ReindexOptions): Promise<BulkResponse> {
    this.ensureConnected();
    const sourceState = this.getIndexState(options.source.index);
    const destName = options.dest.index;
    if (!this.indices.has(destName)) {
      await this.createIndex({ name: destName });
    }

    const operations: BulkOperation[] = [];
    for (const [id, body] of sourceState.documents) {
      if (options.source.query) {
        if (!this.matchesQuery(body, options.source.query)) continue;
      }
      operations.push({ action: 'index', index: destName, id, document: body });
    }

    return this.bulk(operations);
  }

  async count(index: string, _query?: { query: QueryClause }): Promise<number> {
    this.ensureConnected();
    const state = this.getIndexState(index);
    if (!_query) return state.documents.size;
    return Array.from(state.documents.values()).filter(body => this.matchesQuery(body, _query.query)).length;
  }

  private ensureConnected(): void {
    if (!this.connected) throw new ClusterUnavailableError('Provider not connected');
  }

  private getIndexState(index: string): IndexState {
    const state = this.indices.get(index);
    if (!state) throw new IndexNotFoundError(index);
    return state;
  }

  private matchesQuery(body: Record<string, unknown>, query: QueryClause): boolean {
    if ('match_all' in query) return true;
    if ('match' in query) {
      for (const [field, q] of Object.entries(query.match)) {
        const value = String(this.getNestedValue(body, field) ?? '');
        const qStr = typeof q === 'string' ? q : q.query;
        if (!value.toLowerCase().includes(qStr.toLowerCase())) return false;
      }
      return true;
    }
    if ('term' in query) {
      for (const [field, q] of Object.entries(query.term)) {
        const actual = this.getNestedValue(body, field);
        const expected = typeof q === 'object' && 'value' in (q as object) ? (q as { value: unknown }).value : q;
        if (actual != expected) return false;
      }
      return true;
    }
    if ('terms' in query) {
      for (const [field, values] of Object.entries(query.terms)) {
        const actual = this.getNestedValue(body, field);
        if (!values.includes(actual as string | number)) return false;
      }
      return true;
    }
    if ('range' in query) {
      for (const [field, range] of Object.entries(query.range)) {
        const actual = this.getNestedValue(body, field) as number;
        if (range.gte != null && (actual < range.gte)) return false;
        if (range.lte != null && (actual > range.lte)) return false;
        if (range.gt != null && (actual <= range.gt)) return false;
        if (range.lt != null && (actual >= range.lt)) return false;
      }
      return true;
    }
    if ('prefix' in query) {
      for (const [field, p] of Object.entries(query.prefix)) {
        const actual = String(this.getNestedValue(body, field) ?? '');
        if (!actual.toLowerCase().startsWith(p.value.toLowerCase())) return false;
      }
      return true;
    }
    if ('wildcard' in query) {
      for (const [field, w] of Object.entries(query.wildcard)) {
        const actual = String(this.getNestedValue(body, field) ?? '');
        const pattern = '^' + w.value.replace(/\*/g, '.*').replace(/\?/g, '.') + '$';
        if (!new RegExp(pattern, 'i').test(actual)) return false;
      }
      return true;
    }
    if ('fuzzy' in query) {
      for (const [field, f] of Object.entries(query.fuzzy)) {
        const actual = String(this.getNestedValue(body, field) ?? '');
        const expected = f.value.toLowerCase();
        if (!this.fuzzyMatch(actual.toLowerCase(), expected)) return false;
      }
      return true;
    }
    if ('exists' in query) {
      const value = this.getNestedValue(body, query.exists.field);
      return value != null;
    }
    if ('multi_match' in query) {
      const q = query.multi_match;
      const qLower = q.query.toLowerCase();
      return q.fields.some(field => {
        const value = String(this.getNestedValue(body, field) ?? '');
        return value.toLowerCase().includes(qLower);
      });
    }
    if ('bool' in query) {
      const bool = query.bool;
      if (bool.must) {
        for (const clause of bool.must) {
          if (!this.matchesQuery(body, clause)) return false;
        }
      }
      if (bool.filter) {
        for (const clause of bool.filter) {
          if (!this.matchesQuery(body, clause)) return false;
        }
      }
      if (bool.mustNot) {
        for (const clause of bool.mustNot) {
          if (this.matchesQuery(body, clause)) return false;
        }
      }
      if (bool.should && bool.should.length > 0) {
        const minMatch = bool.minimumShouldMatch ?? 1;
        let matchCount = 0;
        for (const clause of bool.should) {
          if (this.matchesQuery(body, clause)) matchCount++;
        }
        if (matchCount < minMatch) return false;
      }
      return true;
    }
    if ('nested' in query) {
      const nestedField = this.getNestedValue(body, query.nested.path);
      if (nestedField == null) return false;
      const items = Array.isArray(nestedField) ? nestedField : [nestedField];
      return items.some((item: Record<string, unknown>) => this.matchesQuery(item, query.nested.query));
    }
    if ('constant_score' in query) {
      return this.matchesQuery(body, query.constant_score.filter);
    }
    if ('boosting' in query) {
      return this.matchesQuery(body, query.boosting.positive) && !this.matchesQuery(body, query.boosting.negative);
    }
    if ('dis_max' in query) {
      return query.dis_max.queries.some(q => this.matchesQuery(body, q));
    }
    if ('function_score' in query) {
      return this.matchesQuery(body, query.function_score.query);
    }
    if ('geo_distance' in query) {
      return true; // simplified
    }
    if ('geo_bounding_box' in query) {
      return true; // simplified
    }
    if ('script' in query) {
      return true; // simplified
    }
    return true;
  }

  private fuzzyMatch(actual: string, expected: string): boolean {
    const maxDist = Math.max(1, Math.floor(expected.length * 0.3));
    if (Math.abs(actual.length - expected.length) > maxDist) return false;
    const dp: number[][] = Array.from({ length: actual.length + 1 }, () => Array(expected.length + 1).fill(0));
    for (let i = 0; i <= actual.length; i++) dp[i][0] = i;
    for (let j = 0; j <= expected.length; j++) dp[0][j] = j;
    for (let i = 1; i <= actual.length; i++) {
      for (let j = 1; j <= expected.length; j++) {
        const cost = actual[i - 1] === expected[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[actual.length][expected.length] <= maxDist;
  }

  private applySort(hits: SearchHit[], sort: SearchQuery['sort']): SearchHit[] {
    if (!sort) return hits;
    return [...hits].sort((a, b) => {
      for (const s of sort) {
        const aVal = this.getNestedValue(a.source, s.field);
        const bVal = this.getNestedValue(b.source, s.field);
        const dir = s.order === 'asc' ? 1 : -1;
        if (aVal == null && bVal == null) continue;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (aVal < bVal) return -1 * dir;
        if (aVal > bVal) return 1 * dir;
      }
      return 0;
    });
  }

  private computeAggregations(hits: SearchHit[], aggs: Record<string, AggregationClause>): Record<string, AggregationResult> {
    const result: Record<string, AggregationResult> = {};
    for (const [name, agg] of Object.entries(aggs)) {
      result[name] = this.computeAggregation(hits, agg);
    }
    return result;
  }

  private computeAggregation(hits: SearchHit[], agg: AggregationClause): AggregationResult {
    if (agg.terms) {
      const counts = new Map<string, number>();
      for (const hit of hits) {
        const value = String(this.getNestedValue(hit.source, agg.terms.field) ?? agg.terms.missing ?? '');
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }
      const buckets: AggregationBucket[] = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, agg.terms.size ?? 10)
        .map(([key, docCount]) => ({ key, docCount }));
      return { buckets };
    }
    if (agg.avg) {
      let sum = 0;
      let count = 0;
      for (const hit of hits) {
        const value = this.getNestedValue(hit.source, agg.avg.field) as number | undefined;
        if (value != null) { sum += value; count++; }
      }
      return { value: count > 0 ? sum / count : 0 };
    }
    if (agg.sum) {
      let sum = 0;
      for (const hit of hits) {
        const value = this.getNestedValue(hit.source, agg.sum.field) as number | undefined;
        sum += value ?? agg.sum.missing ?? 0;
      }
      return { value: sum };
    }
    if (agg.min) {
      let min = Infinity;
      for (const hit of hits) {
        const value = this.getNestedValue(hit.source, agg.min.field) as number | undefined;
        if (value != null) min = Math.min(min, value);
      }
      return { value: min === Infinity ? 0 : min };
    }
    if (agg.max) {
      let max = -Infinity;
      for (const hit of hits) {
        const value = this.getNestedValue(hit.source, agg.max.field) as number | undefined;
        if (value != null) max = Math.max(max, value);
      }
      return { value: max === -Infinity ? 0 : max };
    }
    if (agg.stats) {
      let sum = 0, count = 0, min = Infinity, max = -Infinity;
      for (const hit of hits) {
        const value = this.getNestedValue(hit.source, agg.stats.field) as number | undefined;
        if (value != null) { sum += value; count++; min = Math.min(min, value); max = Math.max(max, value); }
      }
      return { value: count > 0 ? sum / count : 0 };
    }
    if (agg.cardinality) {
      const values = new Set<unknown>();
      for (const hit of hits) {
        values.add(this.getNestedValue(hit.source, agg.cardinality.field));
      }
      return { value: values.size };
    }
    if (agg.range) {
      const buckets: AggregationBucket[] = agg.range.ranges.map(r => {
        let count = 0;
        for (const hit of hits) {
          const value = this.getNestedValue(hit.source, agg.range!.field) as number | undefined;
          if (value != null) {
            const fromOk = r.from == null || value >= r.from;
            const toOk = r.to == null || value < r.to;
            if (fromOk && toOk) count++;
          }
        }
        return { key: r.key ?? `${r.from ?? '*'}-${r.to ?? '*'}`, docCount: count, from: r.from, to: r.to };
      });
      return { buckets };
    }
    if (agg.histogram) {
      const buckets: AggregationBucket[] = [];
      const values = hits.map(h => this.getNestedValue(h.source, agg.histogram!.field) as number).filter(v => v != null);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const interval = agg.histogram.interval;
      for (let key = Math.floor(min / interval) * interval; key <= max; key += interval) {
        const count = values.filter(v => v >= key && v < key + interval).length;
        if (count > 0 || (agg.histogram.minDocCount ?? 0) === 0) {
          buckets.push({ key, docCount: count });
        }
      }
      return { buckets };
    }
    if (agg.dateHistogram) {
      const buckets: AggregationBucket[] = [];
      const values = hits
        .map(h => this.getNestedValue(h.source, agg.dateHistogram!.field) as string | number | Date | undefined)
        .filter(v => v != null)
        .map(v => new Date(v instanceof Date ? v : v as string | number).getTime());
      if (values.length === 0) return { buckets: [] };
      const min = Math.min(...values);
      const max = Math.max(...values);
      const interval = agg.dateHistogram.fixedInterval
        ? parseInterval(agg.dateHistogram.fixedInterval)
        : agg.dateHistogram.calendarInterval
          ? parseInterval(agg.dateHistogram.calendarInterval)
          : 3600000;
      for (let key = Math.floor(min / interval) * interval; key <= max; key += interval) {
        const count = values.filter(v => v >= key && v < key + interval).length;
        if (count > 0) {
          buckets.push({ key, keyAsString: new Date(key).toISOString(), docCount: count });
        }
      }
      return { buckets };
    }
    if (agg.filters) {
      const buckets: AggregationBucket[] = [];
      for (const [key, filter] of Object.entries(agg.filters.filters)) {
        const count = hits.filter(h => this.matchesQuery(h.source, filter)).length;
        buckets.push({ key, docCount: count });
      }
      return { buckets };
    }
    if (agg.topHits) {
      return {
        hits: { hits: agg.topHits.size ? hits.slice(0, agg.topHits.size) : hits },
      };
    }
    return { value: 0 };
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;
    for (const part of parts) {
      if (current == null || typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[part];
    }
    return current;
  }
}

function parseInterval(interval: string): number {
  const match = interval.match(/^(\d+)([smhdw])$/);
  if (!match) return 3600000;
  const value = parseInt(match[1], 10);
  switch (match[2]) {
    case 's': return value * 1000;
    case 'm': return value * 60000;
    case 'h': return value * 3600000;
    case 'd': return value * 86400000;
    case 'w': return value * 604800000;
    default: return 3600000;
  }
}
