'use client';

import type { ReactNode } from 'react';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { ToastProvider } from '@/components/ui/toast';
import { CommandPalette } from '@/features/search/command-palette';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <ToastProvider />
        <CommandPalette />
        {children}
      </ThemeProvider>
    </QueryProvider>
  );
}
