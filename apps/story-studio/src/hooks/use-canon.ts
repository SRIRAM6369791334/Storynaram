'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { canonService } from '@/services/canon.service';

export function useCanon() {
  return useQuery({ queryKey: ['canon'], queryFn: () => canonService.list() });
}

export function useCreateCanonEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => canonService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['canon'] }),
  });
}

export function useDeleteCanonEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => canonService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['canon'] }),
  });
}
