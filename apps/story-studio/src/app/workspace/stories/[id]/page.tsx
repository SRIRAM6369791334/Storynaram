'use client';

import { useParams } from 'next/navigation';
import { useStory } from '@/hooks/use-stories';
import { StoryEditor } from '@/components/workspace/editor';
import { CardSkeleton } from '@/components/ui/skeleton';

export default function StoryPage() {
  const params = useParams<{ id: string }>();
  const { data: story, isLoading } = useStory(params.id);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <CardSkeleton />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Story not found
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-2">
        <h1 className="text-sm font-medium">{story.title}</h1>
        <p className="text-xs text-muted-foreground">{story.status} · {story.genres?.join(', ')}</p>
      </div>
      <div className="flex-1">
        <StoryEditor />
      </div>
    </div>
  );
}
