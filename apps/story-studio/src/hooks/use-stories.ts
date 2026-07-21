'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storiesService, type CreateStoryInput, type UpdateStoryInput } from '@/services/stories.service';

const STORIES_KEY = ['stories'] as const;

export function useStories() {
  return useQuery({ queryKey: STORIES_KEY, queryFn: () => storiesService.list() });
}

export function useStory(id: string) {
  return useQuery({ queryKey: ['stories', id], queryFn: () => storiesService.getById(id), enabled: !!id });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStoryInput) => storiesService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STORIES_KEY }),
  });
}

export function useUpdateStory(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateStoryInput) => storiesService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stories', id] }),
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => storiesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STORIES_KEY }),
  });
}
