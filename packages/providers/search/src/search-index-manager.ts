import { Injectable, Inject, Logger } from '@nestjs/common';
import { SEARCH_PROVIDER } from './tokens.js';
import type { SearchProvider } from './search-provider.interface.js';
import type {
  SearchIndexConfig, IndexTemplate, IndexAlias,
  IndexStatsResponse, ClusterHealthResponse,
} from './types.js';

@Injectable()
export class SearchIndexManager {
  private readonly logger = new Logger(SearchIndexManager.name);

  constructor(
    @Inject(SEARCH_PROVIDER) private readonly provider: SearchProvider,
  ) {}

  async exists(index: string): Promise<boolean> {
    return this.provider.indexExists(index);
  }

  async create(config: SearchIndexConfig): Promise<void> {
    const exists = await this.provider.indexExists(config.name);
    if (exists) {
      this.logger.warn(`Index already exists: ${config.name}`);
      return;
    }
    await this.provider.createIndex(config);
    this.logger.log(`Index created: ${config.name}`);
  }

  async delete(index: string): Promise<void> {
    await this.provider.deleteIndex(index);
    this.logger.log(`Index deleted: ${index}`);
  }

  async list(): Promise<string[]> {
    return this.provider.listIndices();
  }

  async getConfig(index: string): Promise<SearchIndexConfig> {
    return this.provider.getIndexConfig(index);
  }

  async putTemplate(template: IndexTemplate): Promise<void> {
    await this.provider.putIndexTemplate(template);
    this.logger.log(`Index template created: ${template.name}`);
  }

  async deleteTemplate(name: string): Promise<void> {
    await this.provider.deleteIndexTemplate(name);
    this.logger.log(`Index template deleted: ${name}`);
  }

  async getTemplate(name: string): Promise<IndexTemplate> {
    return this.provider.getIndexTemplate(name);
  }

  async listTemplates(): Promise<string[]> {
    return this.provider.listIndexTemplates();
  }

  async putAlias(alias: IndexAlias): Promise<void> {
    await this.provider.putAlias(alias);
    this.logger.log(`Alias created: ${alias.name} -> ${alias.index}`);
  }

  async deleteAlias(alias: string, index?: string): Promise<void> {
    await this.provider.deleteAlias(alias, index);
    this.logger.log(`Alias deleted: ${alias}`);
  }

  async getAliases(index?: string): Promise<IndexAlias[]> {
    return this.provider.getAliases(index);
  }

  async refresh(index: string): Promise<void> {
    await this.provider.refreshIndex(index);
  }

  async flush(index: string): Promise<void> {
    await this.provider.flushIndex(index);
  }

  async stats(index?: string): Promise<IndexStatsResponse | Record<string, IndexStatsResponse>> {
    return this.provider.indexStats(index);
  }

  async clusterHealth(): Promise<ClusterHealthResponse> {
    return this.provider.clusterHealth();
  }
}
