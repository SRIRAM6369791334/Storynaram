'use client';

import { useStories, useCreateStory } from '@/hooks/use-stories';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { StoryList } from '@/features/story/story-list';
import { StoryEditor } from '@/components/workspace/editor';
import { EmptyState } from '@/components/workspace/empty-state';
import { AiChat } from '@/features/ai/ai-chat';
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

export default function WorkspacePage() {
  const { tabs, activeTabId } = useWorkspaceStore();
  const createStory = useCreateStory();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      const story = await createStory.mutateAsync({ title, description });
      useWorkspaceStore.getState().openTab({
        id: `story-${story.id}`,
        title: story.title,
        type: 'story',
        entityId: story.id,
      });
      setShowCreate(false);
      setTitle('');
      setDescription('');
      toast.success('Story created');
    } catch {
      toast.error('Failed to create story');
    }
  };

  if (tabs.length === 0) {
    return (
      <>
        <EmptyState
          title="Welcome to Storynaram Studio"
          description="Your AI-powered story IDE. Create a story to start writing, planning, and publishing."
          actionLabel="Create Story"
          onAction={() => setShowCreate(true)}
        />
        <Dialog open={showCreate} onOpenChange={setShowCreate} title="Create Story" description="Start a new story project">
          <div className="space-y-3">
            <Input label="Title" placeholder="Story title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input label="Description" placeholder="Brief description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Button variant="primary" className="w-full" onClick={handleCreate} disabled={!title.trim() || createStory.isPending}>
              {createStory.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </Dialog>
      </>
    );
  }

  const activeTab = tabs.find((t) => t.id === activeTabId);

  if (activeTab?.type === 'story') {
    return <StoryEditor />;
  }

  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      <p>Select a tab to begin editing</p>
    </div>
  );
}
