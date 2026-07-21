'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, BookOpen, MessageSquare, Eye } from 'lucide-react';

export function StoryEditor() {
  const [content, setContent] = useState('');

  return (
    <div className="flex h-full flex-col">
      <Tabs value="write" onValueChange={() => { /* tab switch handled by default value */ }} className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="write"><FileText className="h-3.5 w-3.5 mr-1" />Write</TabsTrigger>
          <TabsTrigger value="outline"><BookOpen className="h-3.5 w-3.5 mr-1" />Outline</TabsTrigger>
          <TabsTrigger value="dialogue"><MessageSquare className="h-3.5 w-3.5 mr-1" />Dialogue</TabsTrigger>
          <TabsTrigger value="preview"><Eye className="h-3.5 w-3.5 mr-1" />Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="write" className="flex-1 p-0">
          <textarea
            className="h-full w-full resize-none bg-transparent p-4 text-sm font-mono outline-none scrollbar-thin"
            placeholder="Start writing your story..."
            value={content}
            onChange={(e) => { setContent(e.target.value); }}
          />
        </TabsContent>
        <TabsContent value="outline" className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">Chapter 1</p>
            <p className="text-muted-foreground ml-4">Scene 1</p>
            <p className="text-muted-foreground ml-4">Scene 2</p>
          </div>
        </TabsContent>
        <TabsContent value="dialogue" className="flex-1 p-4 overflow-y-auto">
          <p className="text-xs text-muted-foreground">Dialogue editor</p>
        </TabsContent>
        <TabsContent value="preview" className="flex-1 p-4 overflow-y-auto">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {content || <p className="text-muted-foreground">Preview will appear here...</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
