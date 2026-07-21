'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { compositionsService } from '@/services/compositions.service';

export function useCompositions() {
  return useQuery({ queryKey: ['compositions'], queryFn: () => compositionsService.list() });
}

export function useCreateComposition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string }) => compositionsService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['compositions'] }),
  });
}

export function useDeleteComposition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => compositionsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['compositions'] }),
  });
}
