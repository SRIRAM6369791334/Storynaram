import { apiFetch } from './api-client';

export const aiService = {
  async plan(storyId: string, data?: { constraints?: Record<string, unknown>; genre?: string }) {
    return apiFetch(`/stories/${storyId}/plan`, { method: 'POST', body: JSON.stringify({ storyId, ...data }) });
  },

  async generate(storyId: string, data?: { options?: Record<string, unknown>; model?: string }) {
    return apiFetch(`/stories/${storyId}/generate`, { method: 'POST', body: JSON.stringify({ storyId, ...data }) });
  },

  async revise(storyId: string, data?: { focus?: string[]; style?: string }) {
    return apiFetch(`/stories/${storyId}/revise`, { method: 'POST', body: JSON.stringify({ storyId, ...data }) });
  },

  async publish(storyId: string, data?: { formats?: string[]; profile?: string }) {
    return apiFetch(`/stories/${storyId}/publish`, { method: 'POST', body: JSON.stringify({ storyId, ...data }) });
  },

  async getPlanStatus(id: string) {
    return apiFetch(`/stories//plan/${id}`);
  },

  async getGenerationStatus(id: string) {
    return apiFetch(`/stories//generate/${id}`);
  },

  async getRevisionStatus(id: string) {
    return apiFetch(`/stories//revise/${id}`);
  },

  async getPublishStatus(id: string) {
    return apiFetch(`/stories//publish/${id}`);
  },
};
