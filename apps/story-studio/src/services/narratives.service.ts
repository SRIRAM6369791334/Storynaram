import { apiFetch } from './api-client';
import type { Narrative } from '@/types';

export const narrativesService = {
  async list(): Promise<Narrative[]> {
    return apiFetch<Narrative[]>('/narratives');
  },
  async getById(id: string): Promise<Narrative> {
    return apiFetch<Narrative>(`/narratives/${id}`);
  },
  async create(data: { title: string; description?: string }): Promise<Narrative> {
    return apiFetch<Narrative>('/narratives', { method: 'POST', body: JSON.stringify(data) });
  },
  async delete(id: string) {
    await apiFetch<unknown>(`/narratives/${id}`, { method: 'DELETE' });
  },
};
