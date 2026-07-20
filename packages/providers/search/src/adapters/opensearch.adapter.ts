import { Injectable, Logger } from '@nestjs/common';
import type { SearchProvider, AliasAction } from '../search-provider.interface';
import type {
  SearchIndexConfig, IndexTemplate, IndexAlias,
  SearchDocument, BulkOperation, BulkResponse,
  SearchQuery, SearchResult, AutocompleteQuery, FacetResult,
  ClusterHealthResponse, IndexStatsResponse,
  ReindexOptions, QueryClause,
} from '../types';
import { ClusterUnavailableError } from '../errors';

@Injectable()
export class OpenSearchAdapter implements SearchProvider {
  readonly name: string;
  private readonly logger = new Logger(OpenSearchAdapter.name);
  private connected = false;

  constructor(name: string, _config?: Record<string, unknown>) {
    this.name = name;
  }

  async connect(): Promise<void> {
    this.logger.log(`OpenSearch provider ${this.name} ready`);
    this.connected = true;
  }
  async close(): Promise<void> { this.connected = false; }
  async ping(): Promise<boolean> { return this.connected; }
  async indexExists(_index: string): Promise<boolean> { throw new Error('Not implemented'); }
  async createIndex(_config: SearchIndexConfig): Promise<void> { throw new Error('Not implemented'); }
  async deleteIndex(_index: string): Promise<void> { throw new Error('Not implemented'); }
  async getIndexConfig(_index: string): Promise<SearchIndexConfig> { throw new Error('Not implemented'); }
  async listIndices(): Promise<string[]> { throw new Error('Not implemented'); }
  async putIndexTemplate(_template: IndexTemplate): Promise<void> { throw new Error('Not implemented'); }
  async deleteIndexTemplate(_name: string): Promise<void> { throw new Error('Not implemented'); }
  async getIndexTemplate(_name: string): Promise<IndexTemplate> { throw new Error('Not implemented'); }
  async listIndexTemplates(): Promise<string[]> { throw new Error('Not implemented'); }
  async putAlias(_alias: IndexAlias): Promise<void> { throw new Error('Not implemented'); }
  async deleteAlias(_alias: string, _index?: string): Promise<void> { throw new Error('Not implemented'); }
  async getAliases(_index?: string): Promise<IndexAlias[]> { throw new Error('Not implemented'); }
  async updateAliases(_actions: AliasAction[]): Promise<void> { throw new Error('Not implemented'); }
  async index(_document: SearchDocument): Promise<void> { throw new Error('Not implemented'); }
  async update(_document: SearchDocument): Promise<void> { throw new Error('Not implemented'); }
  async delete(_index: string, _id: string): Promise<void> { throw new Error('Not implemented'); }
  async get(_index: string, _id: string): Promise<SearchDocument | null> { throw new Error('Not implemented'); }
  async exists(_index: string, _id: string): Promise<boolean> { throw new Error('Not implemented'); }
  async bulk(_operations: BulkOperation[]): Promise<BulkResponse> { throw new Error('Not implemented'); }
  async search(_query: SearchQuery): Promise<SearchResult> { throw new Error('Not implemented'); }
  async autocomplete(_query: AutocompleteQuery): Promise<string[]> { throw new Error('Not implemented'); }
  async facets(_index: string, _field: string, _prefix?: string, _size?: number): Promise<FacetResult> { throw new Error('Not implemented'); }
  async refreshIndex(_index: string): Promise<void> { throw new Error('Not implemented'); }
  async flushIndex(_index: string): Promise<void> { throw new Error('Not implemented'); }
  async clusterHealth(): Promise<ClusterHealthResponse> { throw new Error('Not implemented'); }
  async indexStats(_index?: string): Promise<IndexStatsResponse | Record<string, IndexStatsResponse>> { throw new Error('Not implemented'); }
  async reindex(_options: ReindexOptions): Promise<BulkResponse> { throw new Error('Not implemented'); }
  async count(_index: string, _query?: { query: QueryClause }): Promise<number> { throw new Error('Not implemented'); }

  protected ensureConnected(): void {
    if (!this.connected) throw new ClusterUnavailableError('OpenSearch not connected');
  }
}
