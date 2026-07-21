'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { narrativesService } from '@/services/narratives.service';

export function useNarratives() {
  return useQuery({ queryKey: ['narratives'], queryFn: () => narrativesService.list() });
}

export function useCreateNarrative() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string }) => narrativesService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['narratives'] }),
  });
}

export function useDeleteNarrative() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => narrativesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['narratives'] }),
  });
}
