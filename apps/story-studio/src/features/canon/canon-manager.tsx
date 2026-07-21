'use client';

import { useState } from 'react';
import { useCanon, useCreateCanonEntry, useDeleteCanonEntry } from '@/hooks/use-canon';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { Button } from '@/components/ui/button';
import { ListSkeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { BookMarked, Plus, Trash2 } from 'lucide-react';

export function CanonManager() {
  const { data: entries, isLoading } = useCanon();
  const createEntry = useCreateCanonEntry();
  const deleteEntry = useDeleteCanonEntry();
  const { openTab } = useWorkspaceStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const entry = await createEntry.mutateAsync({ name, description });
      openTab({ id: `canon-${entry.id}`, title: entry.name, type: 'canon', entityId: entry.id });
      setShowCreate(false);
      setName('');
      setDescription('');
      toast.success('Canon entry created');
    } catch {
      toast.error('Failed to create canon entry');
    }
  };

  if (isLoading) return <ListSkeleton />;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Canon</h2>
        <Button size="sm" variant="ghost" onClick={() => setShowCreate(true)}>
          <Plus className="h-3 w-3 mr-1" />Add
        </Button>
      </div>

      {!entries || entries.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No canon entries yet. Define your story&apos;s canon.</p>
      ) : (
        entries.map((entry) => (
          <div
            key={entry.id}
            className="group flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent/50"
            onClick={() => openTab({ id: `canon-${entry.id}`, title: entry.name, type: 'canon', entityId: entry.id })}
          >
            <div className="flex items-center gap-3">
              <BookMarked className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{entry.name}</p>
                {entry.description && <p className="text-xs text-muted-foreground">{entry.description}</p>}
              </div>
            </div>
            <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); deleteEntry.mutate(entry.id); }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate} title="Add Canon Entry" description="Define a fixed point in your story world">
        <div className="space-y-3">
          <Input label="Name" placeholder="Entry name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Description" placeholder="What is this canon fact?" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button variant="primary" className="w-full" onClick={handleCreate} disabled={!name.trim() || createEntry.isPending}>
            {createEntry.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
