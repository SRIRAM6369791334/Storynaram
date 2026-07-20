import { Injectable, Inject, Logger } from '@nestjs/common';
import { SEARCH_PROVIDER } from './tokens';
import type { SearchProvider } from './search-provider.interface';
import type {
  SearchIndexConfig, IndexTemplate, IndexAlias,
  SearchDocument, BulkOperation, BulkResponse,
  SearchQuery, SearchResult, AutocompleteQuery, FacetResult,
  ClusterHealthResponse, IndexStatsResponse, ReindexOptions,
} from './types';

@Injectable()
export class SearchClient {
  private readonly logger = new Logger(SearchClient.name);

  constructor(
    @Inject(SEARCH_PROVIDER) private readonly provider: SearchProvider,
  ) {}

  get providerName(): string {
    return this.provider.name;
  }

  async connect(): Promise<void> {
    await this.provider.connect();
  }

  async close(): Promise<void> {
    await this.provider.close();
  }

  async ping(): Promise<boolean> {
    return this.provider.ping();
  }

  async indexExists(index: string): Promise<boolean> {
    return this.provider.indexExists(index);
  }

  async createIndex(config: SearchIndexConfig): Promise<void> {
    await this.provider.createIndex(config);
  }

  async deleteIndex(index: string): Promise<void> {
    await this.provider.deleteIndex(index);
  }

  async getIndexConfig(index: string): Promise<SearchIndexConfig> {
    return this.provider.getIndexConfig(index);
  }

  async listIndices(): Promise<string[]> {
    return this.provider.listIndices();
  }

  async putIndexTemplate(template: IndexTemplate): Promise<void> {
    await this.provider.putIndexTemplate(template);
  }

  async deleteIndexTemplate(name: string): Promise<void> {
    await this.provider.deleteIndexTemplate(name);
  }

  async getIndexTemplate(name: string): Promise<IndexTemplate> {
    return this.provider.getIndexTemplate(name);
  }

  async listIndexTemplates(): Promise<string[]> {
    return this.provider.listIndexTemplates();
  }

  async putAlias(alias: IndexAlias): Promise<void> {
    await this.provider.putAlias(alias);
  }

  async deleteAlias(alias: string, index?: string): Promise<void> {
    await this.provider.deleteAlias(alias, index);
  }

  async getAliases(index?: string): Promise<IndexAlias[]> {
    return this.provider.getAliases(index);
  }

  async index(document: SearchDocument): Promise<void> {
    await this.provider.index(document);
  }

  async update(document: SearchDocument): Promise<void> {
    await this.provider.update(document);
  }

  async delete(index: string, id: string): Promise<void> {
    await this.provider.delete(index, id);
  }

  async get(index: string, id: string): Promise<SearchDocument | null> {
    return this.provider.get(index, id);
  }

  async exists(index: string, id: string): Promise<boolean> {
    return this.provider.exists(index, id);
  }

  async bulk(operations: BulkOperation[]): Promise<BulkResponse> {
    return this.provider.bulk(operations);
  }

  async search(query: SearchQuery): Promise<SearchResult> {
    return this.provider.search(query);
  }

  async autocomplete(query: AutocompleteQuery): Promise<string[]> {
    return this.provider.autocomplete(query);
  }

  async facets(index: string, field: string, prefix?: string, size?: number): Promise<FacetResult> {
    return this.provider.facets(index, field, prefix, size);
  }

  async refreshIndex(index: string): Promise<void> {
    await this.provider.refreshIndex(index);
  }

  async flushIndex(index: string): Promise<void> {
    await this.provider.flushIndex(index);
  }

  async clusterHealth(): Promise<ClusterHealthResponse> {
    return this.provider.clusterHealth();
  }

  async indexStats(index?: string): Promise<IndexStatsResponse | Record<string, IndexStatsResponse>> {
    return this.provider.indexStats(index);
  }

  async reindex(options: ReindexOptions): Promise<BulkResponse> {
    return this.provider.reindex(options);
  }

  async count(index: string, query?: { query: SearchQuery['query'] }): Promise<number> {
    return this.provider.count(index, query);
  }
}
