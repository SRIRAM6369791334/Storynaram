import { apiFetch } from './api-client';
import type { Timeline } from '@/types';

export const timelinesService = {
  async list(): Promise<Timeline[]> {
    return apiFetch<Timeline[]>('/timelines');
  },
  async getById(id: string): Promise<Timeline> {
    return apiFetch<Timeline>(`/timelines/${id}`);
  },
  async create(data: { name: string; description?: string }): Promise<Timeline> {
    return apiFetch<Timeline>('/timelines', { method: 'POST', body: JSON.stringify(data) });
  },
  async delete(id: string) {
    await apiFetch<unknown>(`/timelines/${id}`, { method: 'DELETE' });
  },
};
