'use client';

import { useState } from 'react';
import { useWorlds, useCreateWorld } from '@/hooks/use-worlds';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ListSkeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Globe, Plus, Trash2 } from 'lucide-react';

export function WorldBuilder() {
  const { data: worlds, isLoading } = useWorlds();
  const createWorld = useCreateWorld();
  const { openTab } = useWorkspaceStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const world = await createWorld.mutateAsync({ name, description, genre });
      openTab({ id: `world-${world.id}`, title: world.name, type: 'world', entityId: world.id });
      setShowCreate(false);
      setName('');
      setDescription('');
      setGenre('');
      toast.success('World created');
    } catch {
      toast.error('Failed to create world');
    }
  };

  if (isLoading) return <ListSkeleton />;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Worlds</h2>
        <Button size="sm" variant="ghost" onClick={() => { setShowCreate(true); }}>
          <Plus className="h-3 w-3 mr-1" />Add
        </Button>
      </div>

      {!worlds || worlds.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No worlds yet. Build your story universe.</p>
      ) : (
        worlds.map((world) => (
          <div
            key={world.id}
            className="group flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent/50"
            onClick={() => { openTab({ id: `world-${world.id}`, title: world.name, type: 'world', entityId: world.id }); }}
          >
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{world.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {world.genre && <Badge variant="default">{world.genre}</Badge>}
                  {world.description && <span className="text-xs text-muted-foreground truncate max-w-32">{world.description}</span>}
                </div>
              </div>
            </div>
            <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate} title="Create World" description="Build your story universe">
        <div className="space-y-3">
          <Input label="Name" placeholder="World name" value={name} onChange={(e) => { setName(e.target.value); }} />
          <Input label="Genre" placeholder="e.g. fantasy, sci-fi" value={genre} onChange={(e) => { setGenre(e.target.value); }} />
          <Input label="Description" placeholder="Brief description" value={description} onChange={(e) => { setDescription(e.target.value); }} />
          <Button variant="primary" className="w-full" onClick={() => { void handleCreate(); }} disabled={!name.trim() || createWorld.isPending}>
            {createWorld.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
