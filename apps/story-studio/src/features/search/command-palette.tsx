'use client';

import { useState, useEffect, useRef } from 'react';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useAuth } from '@/hooks/use-auth';
import { searchService } from '@/services/search.service';
import { Search, FileText, Users, Globe, ArrowRight, LogOut } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPalette() {
  const { isCommandPaletteOpen, setCommandPaletteOpen, openTab } = useWorkspaceStore();
  const { logout } = useAuth();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 200);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape') setCommandPaletteOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const commands: CommandItem[] = [
    { id: 'new-story', label: 'Create New Story', description: 'Start a new story project', icon: <FileText className="h-4 w-4" />, action: () => { setCommandPaletteOpen(false); } },
    { id: 'search-stories', label: 'Search Stories', description: 'Find stories by title or content', icon: <Search className="h-4 w-4" />, action: () => { setCommandPaletteOpen(false); } },
    { id: 'search-characters', label: 'Search Characters', description: 'Find characters by name or role', icon: <Users className="h-4 w-4" />, action: () => { setCommandPaletteOpen(false); } },
    { id: 'search-worlds', label: 'Search Worlds', description: 'Find worlds by name or description', icon: <Globe className="h-4 w-4" />, action: () => { setCommandPaletteOpen(false); } },
    { id: 'logout', label: 'Sign Out', description: 'Log out of your account', icon: <LogOut className="h-4 w-4" />, action: () => { logout(); setCommandPaletteOpen(false); } },
  ];

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()) || c.description?.toLowerCase().includes(query.toLowerCase()))
    : commands;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setCommandPaletteOpen(false)}>
      <div className="fixed inset-0 bg-black/50" />
      <div className="relative w-full max-w-lg rounded-lg border bg-background shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <input
            ref={inputRef}
            className="flex-1 h-11 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.map((item) => (
            <button
              key={item.id}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
              onClick={item.action}
            >
              <span className="text-muted-foreground">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.label}</p>
                {item.description && <p className="text-xs text-muted-foreground truncate">{item.description}</p>}
              </div>
              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
