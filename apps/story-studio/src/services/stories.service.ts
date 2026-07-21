import { apiFetch } from './api-client';
import type { Story } from '@/types';

export interface CreateStoryInput {
  title: string;
  description?: string;
  genres?: string[];
}

export interface UpdateStoryInput {
  title?: string;
  description?: string;
  genres?: string[];
}

export const storiesService = {
  async list(): Promise<Story[]> {
    return apiFetch<Story[]>('/stories');
  },

  async getById(id: string): Promise<Story> {
    return apiFetch<Story>(`/stories/${id}`);
  },

  async create(data: CreateStoryInput): Promise<Story> {
    return apiFetch<Story>('/stories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateStoryInput): Promise<Story> {
    return apiFetch<Story>(`/stories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    await apiFetch<unknown>(`/stories/${id}`, { method: 'DELETE' });
  },
};
