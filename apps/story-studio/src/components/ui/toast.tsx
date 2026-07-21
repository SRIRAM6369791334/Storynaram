'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function ToastProvider() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        className: 'border border-border bg-background text-foreground',
        duration: 4000,
      }}
    />
  );
}

export { toast } from 'sonner';
