import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'No content yet',
  description = 'Get started by creating your first story.',
  actionLabel = 'Create Story',
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="rounded-full bg-muted p-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        {onAction && (
          <Button variant="primary" onClick={onAction}>
            <Plus className="h-4 w-4 mr-1" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
