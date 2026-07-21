'use client';

import { useWorkspaceStore } from '@/stores/workspace-store';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Bot, Sparkles, Search, Info } from 'lucide-react';

export function RightPanel() {
  const { showRightPanel } = useWorkspaceStore();

  if (!showRightPanel) return null;

  return (
    <div className="flex h-full w-[320px] flex-col border-l bg-background">
      <Tabs value="ai" onValueChange={() => { /* tab switch handled by value */ }} className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="ai"><Bot className="h-3.5 w-3.5 mr-1" />AI</TabsTrigger>
          <TabsTrigger value="quality"><Sparkles className="h-3.5 w-3.5 mr-1" />Quality</TabsTrigger>
          <TabsTrigger value="inspector"><Info className="h-3.5 w-3.5 mr-1" />Inspector</TabsTrigger>
        </TabsList>
        <TabsContent value="ai" className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-3">
            <div className="rounded-lg border p-3">
              <h3 className="text-sm font-medium mb-2">AI Assistant</h3>
              <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                <p>Select a story to start working with AI assistance.</p>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <h3 className="text-sm font-medium mb-2">Revision Suggestions</h3>
              <p className="text-xs text-muted-foreground">No active suggestions.</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="quality" className="flex-1 p-3 overflow-y-auto">
          <div className="rounded-lg border p-3">
            <h3 className="text-sm font-medium mb-2">Quality Score</h3>
            <div className="text-2xl font-bold text-center py-4">--</div>
            <p className="text-xs text-muted-foreground text-center">Generate content to see quality metrics.</p>
          </div>
        </TabsContent>
        <TabsContent value="inspector" className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>Select a character, world, or timeline to inspect.</p>
          </div>
        </TabsContent>
      </Tabs>
      <div className="border-t p-2">
        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground">
          <Search className="h-3 w-3" />
          <span>Ask AI anything...</span>
        </div>
      </div>
    </div>
  );
}
