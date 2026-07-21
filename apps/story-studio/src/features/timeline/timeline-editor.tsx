'use client';

import { useState } from 'react';
import { useTimelines, useCreateTimeline, useDeleteTimeline } from '@/hooks/use-timelines';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { Button } from '@/components/ui/button';
import { ListSkeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { TimelineGraph } from '@/features/visual-editors/timeline-graph';
import { Clock, Plus, Trash2 } from 'lucide-react';

export function TimelineEditor() {
  const { data: timelines, isLoading } = useTimelines();
  const createTimeline = useCreateTimeline();
  const deleteTimeline = useDeleteTimeline();
  const { openTab } = useWorkspaceStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const tl = await createTimeline.mutateAsync({ name, description });
      openTab({ id: `timeline-${tl.id}`, title: tl.name, type: 'timeline', entityId: tl.id });
      setShowCreate(false);
      setName('');
      setDescription('');
      toast.success('Timeline created');
    } catch {
      toast.error('Failed to create timeline');
    }
  };

  if (isLoading) return <ListSkeleton />;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Timelines</h2>
        <Button size="sm" variant="ghost" onClick={() => setShowCreate(true)}>
          <Plus className="h-3 w-3 mr-1" />Add
        </Button>
      </div>

      {!timelines || timelines.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No timelines yet. Track your story chronology.</p>
      ) : (
        timelines.map((tl) => (
          <div
            key={tl.id}
            className="group flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent/50"
            onClick={() => openTab({ id: `timeline-${tl.id}`, title: tl.name, type: 'timeline', entityId: tl.id })}
          >
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{tl.name}</p>
                {tl.description && <p className="text-xs text-muted-foreground">{tl.description}</p>}
              </div>
            </div>
            <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); deleteTimeline.mutate(tl.id); }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate} title="Create Timeline" description="Track key events in your story">
        <div className="space-y-3">
          <Input label="Name" placeholder="Timeline name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Description" placeholder="Brief description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button variant="primary" className="w-full" onClick={handleCreate} disabled={!name.trim() || createTimeline.isPending}>
            {createTimeline.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
