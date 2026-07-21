'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timelinesService } from '@/services/timelines.service';

export function useTimelines() {
  return useQuery({ queryKey: ['timelines'], queryFn: () => timelinesService.list() });
}

export function useCreateTimeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => timelinesService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timelines'] }),
  });
}

export function useDeleteTimeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => timelinesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timelines'] }),
  });
}
