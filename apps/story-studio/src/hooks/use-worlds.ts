'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { worldsService } from '@/services/worlds.service';

export function useWorlds() {
  return useQuery({ queryKey: ['worlds'], queryFn: () => worldsService.list() });
}

export function useCreateWorld() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; genre?: string }) => worldsService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['worlds'] }),
  });
}
