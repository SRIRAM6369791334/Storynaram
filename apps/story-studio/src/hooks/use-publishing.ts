'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publishingService } from '@/services/publishing.service';

export function usePublications(storyId?: string) {
  return useQuery({
    queryKey: ['publications', storyId],
    queryFn: () => publishingService.list(storyId),
  });
}

export function usePublishStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { storyId: string; formats?: string[]; profile?: string }) => publishingService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['publications'] }),
  });
}
