'use client';

import { useWorkspaceStore } from '@/stores/workspace-store';
import {
  FileText, Users, Globe, Calendar, BookOpen,
  PenTool, Layout, BookMarked, ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const sidebarItems = [
  { id: 'explorer', label: 'Story Explorer', icon: FileText },
  { id: 'projects', label: 'Projects', icon: Layout },
  { id: 'characters', label: 'Characters', icon: Users },
  { id: 'world', label: 'World', icon: Globe },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'canon', label: 'Canon', icon: BookOpen },
  { id: 'narrative', label: 'Narrative', icon: PenTool },
  { id: 'composition', label: 'Composition', icon: Layout },
  { id: 'assets', label: 'Assets', icon: BookMarked },
  { id: 'publishing', label: 'Publishing', icon: BookMarked },
];

export function Sidebar() {
  const { showLeftSidebar, activeLeftView, setActiveLeftView, toggleLeftSidebar } = useWorkspaceStore();

  if (!showLeftSidebar) return null;

  return (
    <div className="flex h-full w-[52px] flex-col items-center border-r bg-sidebar py-2 gap-1">
      {sidebarItems.map((item) => (
        <Button
          key={item.id}
          variant={activeLeftView === item.id ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => { setActiveLeftView(item.id); }}
          title={item.label}
        >
          <item.icon className="h-4 w-4" />
        </Button>
      ))}
      <div className="flex-1" />
      <Button variant="ghost" size="icon" onClick={toggleLeftSidebar}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function SidebarPanel() {
  const { activeLeftView } = useWorkspaceStore();
  const item = sidebarItems.find((i) => i.id === activeLeftView);

  return (
    <div className="flex h-full w-[220px] flex-col border-r bg-background">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        {item && <item.icon className="h-4 w-4" />}
        <span className="text-sm font-medium">{item?.label ?? 'Explorer'}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        <p className="text-xs text-muted-foreground">Select an item from the sidebar</p>
      </div>
    </div>
  );
}
