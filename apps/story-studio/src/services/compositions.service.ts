import { apiFetch } from './api-client';
import type { Composition } from '@/types';

export const compositionsService = {
  async list(): Promise<Composition[]> {
    return apiFetch<Composition[]>('/compositions');
  },
  async getById(id: string): Promise<Composition> {
    return apiFetch<Composition>(`/compositions/${id}`);
  },
  async create(data: { title: string; description?: string }): Promise<Composition> {
    return apiFetch<Composition>('/compositions', { method: 'POST', body: JSON.stringify(data) });
  },
  async delete(id: string) {
    await apiFetch<unknown>(`/compositions/${id}`, { method: 'DELETE' });
  },
};
