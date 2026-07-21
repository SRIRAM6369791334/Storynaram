import { apiFetch } from './api-client';
import type { World } from '@/types';

export const worldsService = {
  async list(): Promise<World[]> {
    return apiFetch<World[]>('/worlds');
  },
  async getById(id: string): Promise<World> {
    return apiFetch<World>(`/worlds/${id}`);
  },
  async create(data: { name: string; description?: string; genre?: string }): Promise<World> {
    return apiFetch<World>('/worlds', { method: 'POST', body: JSON.stringify(data) });
  },
  async delete(id: string) {
    await apiFetch<unknown>(`/worlds/${id}`, { method: 'DELETE' });
  },
};
