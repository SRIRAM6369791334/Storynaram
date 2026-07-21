'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { charactersService } from '@/services/characters.service';

export function useCharacters(storyId?: string) {
  return useQuery({
    queryKey: ['characters', storyId],
    queryFn: () => charactersService.list(storyId),
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; role?: string; species?: string; storyId?: string }) => charactersService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['characters'] }),
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => charactersService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['characters'] }),
  });
}
