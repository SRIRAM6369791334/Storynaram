'use client';

import { useStories, useDeleteStory, useCreateStory } from '@/hooks/use-stories';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ListSkeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { Plus, Trash2, FileText, Calendar } from 'lucide-react';
import { formatDate } from '@/utils/format';
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function StoryList() {
  const { data: stories, isLoading } = useStories();
  const createStory = useCreateStory();
  const deleteStory = useDeleteStory();
  const { openTab } = useWorkspaceStore();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      const story = await createStory.mutateAsync({ title, description });
      openTab({ id: `story-${story.id}`, title: story.title, type: 'story', entityId: story.id });
      setShowCreate(false);
      setTitle('');
      setDescription('');
      toast.success('Story created');
    } catch {
      toast.error('Failed to create story');
    }
  };

  if (isLoading) return <ListSkeleton />;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Stories</h2>
        <Button size="sm" variant="ghost" onClick={() => { setShowCreate(true); }}>
          <Plus className="h-3 w-3 mr-1" />New
        </Button>
      </div>

      {!stories || stories.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No stories yet. Create one to get started.</p>
      ) : (
        stories.map((story) => (
          <div
            key={story.id}
            className="group flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => { openTab({ id: `story-${story.id}`, title: story.title, type: 'story', entityId: story.id }); }}
          >
            <div className="flex items-start gap-3 min-w-0">
              <FileText className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{story.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={story.status === 'published' ? 'success' : 'default'}>{story.status}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />{formatDate(story.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 shrink-0"
              onClick={(e) => { e.stopPropagation(); deleteStory.mutate(story.id); toast.success('Story deleted'); }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate} title="Create Story" description="Create a new story project">
        <div className="space-y-3">
          <Input label="Title" placeholder="Story title" value={title} onChange={(e) => { setTitle(e.target.value); }} />
          <Input label="Description" placeholder="Brief description" value={description} onChange={(e) => { setDescription(e.target.value); }} />
          <Button variant="primary" className="w-full" onClick={() => { void handleCreate(); }} disabled={!title.trim() || createStory.isPending}>
            {createStory.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
