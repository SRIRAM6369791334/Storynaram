import { apiFetch } from './api-client';
import type { Character } from '@/types';

export const charactersService = {
  async list(storyId?: string): Promise<Character[]> {
    return apiFetch<Character[]>('/characters', { params: { storyId } });
  },

  async getById(id: string): Promise<Character> {
    return apiFetch<Character>(`/characters/${id}`);
  },

  async create(data: { name: string; role?: string; species?: string; storyId?: string }): Promise<Character> {
    return apiFetch<Character>('/characters', { method: 'POST', body: JSON.stringify(data) });
  },

  async delete(id: string) {
    await apiFetch<unknown>(`/characters/${id}`, { method: 'DELETE' });
  },
};
