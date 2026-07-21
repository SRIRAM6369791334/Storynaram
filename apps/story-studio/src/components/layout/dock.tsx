'use client';

import { useWorkspaceStore } from '@/stores/workspace-store';
import { cn } from '@/utils/cn';
import { X, FileText } from 'lucide-react';

export function Dock() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useWorkspaceStore();

  if (tabs.length === 0) return null;

  return (
    <div className="flex h-9 items-center border-b bg-muted/30 overflow-x-auto scrollbar-thin">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            'flex items-center gap-1.5 px-3 h-full border-r text-xs cursor-pointer whitespace-nowrap hover:bg-accent/50 transition-colors',
            activeTabId === tab.id && 'bg-background border-b-2 border-b-primary',
          )}
          onClick={() => setActiveTab(tab.id)}
        >
          <FileText className="h-3 w-3" />
          <span>{tab.title}</span>
          {tab.isDirty && <span className="text-primary">*</span>}
          <button
            className="ml-1 rounded-sm hover:bg-accent p-0.5"
            onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
