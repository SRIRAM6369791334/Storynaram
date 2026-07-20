import { Injectable, Logger } from '@nestjs/common';
import { SearchClient } from './search-client';
import { ProviderNotFoundError } from './errors';

@Injectable()
export class SearchRegistry {
  private readonly logger = new Logger(SearchRegistry.name);
  private readonly providers = new Map<string, SearchClient>();

  register(name: string, client: SearchClient): void {
    this.providers.set(name, client);
    this.logger.log(`Search provider registered: ${name}`);
  }

  getClient(name: string): SearchClient {
    const client = this.providers.get(name);
    if (!client) throw new ProviderNotFoundError(name);
    return client;
  }

  hasProvider(name: string): boolean {
    return this.providers.has(name);
  }

  getAllProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  async pingAll(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    for (const [name, client] of this.providers) {
      try {
        results[name] = await client.ping();
      } catch {
        results[name] = false;
      }
    }
    return results;
  }

  async closeAll(): Promise<void> {
    for (const [name, client] of this.providers) {
      try {
        await client.close();
        this.logger.log(`Search provider closed: ${name}`);
      } catch (err) {
        this.logger.error(`Error closing provider ${name}`, err);
      }
    }
    this.providers.clear();
  }
}
