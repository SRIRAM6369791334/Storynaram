'use client';

import { useState } from 'react';
import { useCompositions, useCreateComposition, useDeleteComposition } from '@/hooks/use-compositions';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { Button } from '@/components/ui/button';
import { ListSkeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Layers, Plus, Trash2 } from 'lucide-react';

export function CompositionEditor() {
  const { data: compositions, isLoading } = useCompositions();
  const createComposition = useCreateComposition();
  const deleteComposition = useDeleteComposition();
  const { openTab } = useWorkspaceStore();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      const comp = await createComposition.mutateAsync({ title, description });
      openTab({ id: `composition-${comp.id}`, title: comp.title, type: 'composition', entityId: comp.id });
      setShowCreate(false);
      setTitle('');
      setDescription('');
      toast.success('Composition created');
    } catch {
      toast.error('Failed to create composition');
    }
  };

  if (isLoading) return <ListSkeleton />;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Compositions</h2>
        <Button size="sm" variant="ghost" onClick={() => { setShowCreate(true); }}>
          <Plus className="h-3 w-3 mr-1" />Add
        </Button>
      </div>

      {!compositions || compositions.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No compositions yet. Compile your scenes and chapters.</p>
      ) : (
        compositions.map((comp) => (
          <div
            key={comp.id}
            className="group flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent/50"
            onClick={() => { openTab({ id: `composition-${comp.id}`, title: comp.title, type: 'composition', entityId: comp.id }); }}
          >
            <div className="flex items-center gap-3">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{comp.title}</p>
                {comp.description && <p className="text-xs text-muted-foreground">{comp.description}</p>}
              </div>
            </div>
            <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); deleteComposition.mutate(comp.id); }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate} title="Create Composition" description="Compile scenes and chapters">
        <div className="space-y-3">
          <Input label="Title" placeholder="Composition title" value={title} onChange={(e) => { setTitle(e.target.value); }} />
          <Input label="Description" placeholder="Brief description" value={description} onChange={(e) => { setDescription(e.target.value); }} />
          <Button variant="primary" className="w-full" onClick={() => { void handleCreate(); }} disabled={!title.trim() || createComposition.isPending}>
            {createComposition.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
