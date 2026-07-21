import { apiFetch } from './api-client';
import type { CanonEntry } from '@/types';

export const canonService = {
  async list(): Promise<CanonEntry[]> {
    return apiFetch<CanonEntry[]>('/canon');
  },
  async getById(id: string): Promise<CanonEntry> {
    return apiFetch<CanonEntry>(`/canon/${id}`);
  },
  async create(data: { name: string; description?: string }): Promise<CanonEntry> {
    return apiFetch<CanonEntry>('/canon', { method: 'POST', body: JSON.stringify(data) });
  },
  async delete(id: string) {
    await apiFetch<unknown>(`/canon/${id}`, { method: 'DELETE' });
  },
};
