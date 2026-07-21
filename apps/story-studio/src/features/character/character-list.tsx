'use client';

import { useCharacters, useCreateCharacter, useDeleteCharacter } from '@/hooks/use-characters';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { Button } from '@/components/ui/button';
import { ListSkeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function CharacterList() {
  const { data: characters, isLoading } = useCharacters();
  const createCharacter = useCreateCharacter();
  const deleteCharacter = useDeleteCharacter();
  const { openTab } = useWorkspaceStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const char = await createCharacter.mutateAsync({ name, role });
      openTab({ id: `character-${char.id}`, title: char.name, type: 'character', entityId: char.id });
      setShowCreate(false);
      setName('');
      setRole('');
      toast.success('Character created');
    } catch {
      toast.error('Failed to create character');
    }
  };

  if (isLoading) return <ListSkeleton />;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Characters</h2>
        <Button size="sm" variant="ghost" onClick={() => { setShowCreate(true); }}>
          <Plus className="h-3 w-3 mr-1" />Add
        </Button>
      </div>

      {!characters || characters.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No characters yet.</p>
      ) : (
        characters.map((char) => (
          <div
            key={char.id}
            className="group flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent/50"
            onClick={() => { openTab({ id: `character-${char.id}`, title: char.name, type: 'character', entityId: char.id }); }}
          >
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{char.name}</p>
                {char.role && <p className="text-xs text-muted-foreground">{char.role}</p>}
              </div>
            </div>
            <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); deleteCharacter.mutate(char.id); }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate} title="Add Character" description="Create a new character">
        <div className="space-y-3">
          <Input label="Name" placeholder="Character name" value={name} onChange={(e) => { setName(e.target.value); }} />
          <Input label="Role" placeholder="e.g. protagonist, villain" value={role} onChange={(e) => { setRole(e.target.value); }} />
          <Button variant="primary" className="w-full" onClick={() => { void handleCreate(); }} disabled={!name.trim()}>Create</Button>
        </div>
      </Dialog>
    </div>
  );
}
