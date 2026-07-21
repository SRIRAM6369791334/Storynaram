'use client';

import { useState } from 'react';
import { usePublications, usePublishStory } from '@/hooks/use-publishing';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ListSkeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { Dialog } from '@/components/ui/dialog';
import { Globe, Plus, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export function PublishingManager() {
  const { data: publications, isLoading } = usePublications();
  const publishStory = usePublishStory();
  const { openTab } = useWorkspaceStore();
  const [showPublish, setShowPublish] = useState(false);
  const [storyId, setStoryId] = useState('');

  const handlePublish = async () => {
    if (!storyId.trim()) return;
    try {
      const pub = await publishStory.mutateAsync({ storyId, formats: ['epub', 'pdf'] });
      openTab({ id: `publication-${pub.id}`, title: `Publication ${pub.id.slice(0, 8)}`, type: 'publication', entityId: pub.id });
      setShowPublish(false);
      setStoryId('');
      toast.success('Publication started');
    } catch {
      toast.error('Failed to start publication');
    }
  };

  if (isLoading) return <ListSkeleton />;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Publishing</h2>
        <Button size="sm" variant="ghost" onClick={() => { setShowPublish(true); }}>
          <Plus className="h-3 w-3 mr-1" />Publish
        </Button>
      </div>

      {!publications || publications.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No publications yet. Publish your story to share it.</p>
      ) : (
        publications.map((pub) => (
          <div
            key={pub.id}
            className="group flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent/50"
            onClick={() => { openTab({ id: `publication-${pub.id}`, title: `Publication ${pub.id.slice(0, 8)}`, type: 'publication', entityId: pub.id }); }}
          >
            <div className="flex items-center gap-3">
              {pub.status === 'completed' ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : pub.status === 'failed' ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
              )}
              <div>
                <p className="text-sm font-medium">Story {pub.storyId.slice(0, 8)}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={pub.status === 'completed' ? 'success' : 'default'}>{pub.status}</Badge>
                  {pub.formats?.map((f) => <span key={f} className="text-xs text-muted-foreground">{f}</span>)}
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      <Dialog open={showPublish} onOpenChange={setShowPublish} title="Publish Story" description="Export your story to shareable formats">
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            <Globe className="h-4 w-4 inline mr-1" />
            Your story will be published in EPUB and PDF formats.
          </div>
          <Button variant="primary" className="w-full" onClick={() => { void handlePublish(); }} disabled={!storyId.trim() || publishStory.isPending}>
            {publishStory.isPending ? 'Publishing...' : 'Start Publication'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
