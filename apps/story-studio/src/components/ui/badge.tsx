import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-secondary text-secondary-foreground',
        variant === 'success' && 'bg-green-500/10 text-green-600 dark:text-green-400',
        variant === 'warning' && 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
        variant === 'danger' && 'bg-red-500/10 text-red-600 dark:text-red-400',
        className,
      )}
    >
      {children}
    </span>
  );
}
