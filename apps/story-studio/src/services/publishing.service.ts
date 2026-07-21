import { apiFetch } from './api-client';
import type { Publication } from '@/types';

export const publishingService = {
  async list(storyId?: string): Promise<Publication[]> {
    const path = storyId ? `/stories/${storyId}/publishing` : '/stories/';
    return apiFetch<Publication[]>(path);
  },
  async getById(id: string): Promise<Publication> {
    return apiFetch<Publication>(`/stories/publishing/${id}`);
  },
  async create(data: { storyId: string; formats?: string[]; profile?: string }): Promise<Publication> {
    return apiFetch<Publication>(`/stories/${data.storyId}/publishing`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async getStatus(id: string): Promise<Publication> {
    return apiFetch<Publication>(`/stories/publishing/${id}`);
  },
};
