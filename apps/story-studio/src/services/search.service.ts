import { apiFetch } from './api-client';
import type { SearchResult } from '@/types';

export const searchService = {
  async search(q: string, type?: string, page?: number, limit?: number): Promise<SearchResult> {
    return apiFetch<SearchResult>('/search', {
      params: { q, type, page: page?.toString(), limit: limit?.toString() },
    });
  },
  async searchStories(q: string): Promise<SearchResult> {
    return apiFetch<SearchResult>('/search/stories', { params: { q } });
  },
  async searchCharacters(q: string): Promise<SearchResult> {
    return apiFetch<SearchResult>('/search/characters', { params: { q } });
  },
  async searchWorlds(q: string): Promise<SearchResult> {
    return apiFetch<SearchResult>('/search/worlds', { params: { q } });
  },
};
