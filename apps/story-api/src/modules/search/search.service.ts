import { Injectable, Logger } from '@nestjs/common';

export interface SearchResult<T = unknown> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SearchableDocument {
  id: string;
  type: string;
  title: string;
  content: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly documents: SearchableDocument[] = [];

  async index(document: SearchableDocument): Promise<void> {
    this.documents.push(document);
    this.logger.debug(`Indexed ${document.type}:${document.id}`);
  }

  async search(query: string, type?: string, page = 1, limit = 20): Promise<SearchResult<SearchableDocument>> {
    const lowerQuery = query.toLowerCase();
    let filtered = this.documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(lowerQuery) ||
        doc.content.toLowerCase().includes(lowerQuery) ||
        doc.tags?.some((t) => t.toLowerCase().includes(lowerQuery)),
    );

    if (type) {
      filtered = filtered.filter((doc) => doc.type === type);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return { items, total, page, limit };
  }

  async searchStories(query: string): Promise<SearchResult<SearchableDocument>> {
    return this.search(query, 'story');
  }

  async searchCharacters(query: string): Promise<SearchResult<SearchableDocument>> {
    return this.search(query, 'character');
  }

  async searchWorlds(query: string): Promise<SearchResult<SearchableDocument>> {
    return this.search(query, 'world');
  }

  async searchTimelines(query: string): Promise<SearchResult<SearchableDocument>> {
    return this.search(query, 'timeline');
  }

  async searchCanon(query: string): Promise<SearchResult<SearchableDocument>> {
    return this.search(query, 'canon');
  }
}
