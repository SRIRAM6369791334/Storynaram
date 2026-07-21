'use client';

import { useWorkspaceStore } from '@/stores/workspace-store';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Terminal, Bell, Bot, ListOrdered } from 'lucide-react';

export function BottomPanel() {
  const { showBottomPanel } = useWorkspaceStore();

  if (!showBottomPanel) return null;

  return (
    <div className="flex h-[200px] flex-col border-t bg-background">
      <Tabs value="console" onValueChange={() => { /* tab switch handled by value */ }} className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-1 h-7">
          <TabsTrigger value="console" className="text-xs py-0"><Terminal className="h-3 w-3 mr-1" />Console</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs py-0"><Bell className="h-3 w-3 mr-1" />Notifications</TabsTrigger>
          <TabsTrigger value="ai-tasks" className="text-xs py-0"><Bot className="h-3 w-3 mr-1" />AI Tasks</TabsTrigger>
          <TabsTrigger value="queue" className="text-xs py-0"><ListOrdered className="h-3 w-3 mr-1" />Queue</TabsTrigger>
        </TabsList>
        <TabsContent value="console" className="flex-1 p-2 overflow-y-auto">
          <div className="font-mono text-xs text-muted-foreground space-y-1">
            <p>[{new Date().toLocaleTimeString()}] Studio ready</p>
          </div>
        </TabsContent>
        <TabsContent value="notifications" className="flex-1 p-2 overflow-y-auto">
          <p className="text-xs text-muted-foreground">No notifications</p>
        </TabsContent>
        <TabsContent value="ai-tasks" className="flex-1 p-2 overflow-y-auto">
          <p className="text-xs text-muted-foreground">No active AI tasks</p>
        </TabsContent>
        <TabsContent value="queue" className="flex-1 p-2 overflow-y-auto">
          <p className="text-xs text-muted-foreground">Generation queue: empty</p>
          <p className="text-xs text-muted-foreground">Publishing queue: empty</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
