import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreateTimeline } from '../src/hooks/use-timelines';
import { useCreateCanonEntry } from '../src/hooks/use-canon';
import { useCreateNarrative } from '../src/hooks/use-narratives';
import { useCreateComposition } from '../src/hooks/use-compositions';
import { usePublishStory } from '../src/hooks/use-publishing';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function Wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  queryClient.clear();
});

describe('useCreateTimeline', () => {
  it('provides mutateAsync function', () => {
    const { result } = renderHook(() => useCreateTimeline(), { wrapper: Wrapper });
    expect(result.current.mutateAsync).toBeDefined();
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});

describe('useCreateCanonEntry', () => {
  it('provides mutateAsync function', () => {
    const { result } = renderHook(() => useCreateCanonEntry(), { wrapper: Wrapper });
    expect(result.current.mutateAsync).toBeDefined();
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});

describe('useCreateNarrative', () => {
  it('provides mutateAsync function', () => {
    const { result } = renderHook(() => useCreateNarrative(), { wrapper: Wrapper });
    expect(result.current.mutateAsync).toBeDefined();
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});

describe('useCreateComposition', () => {
  it('provides mutateAsync function', () => {
    const { result } = renderHook(() => useCreateComposition(), { wrapper: Wrapper });
    expect(result.current.mutateAsync).toBeDefined();
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});

describe('usePublishStory', () => {
  it('provides mutateAsync function', () => {
    const { result } = renderHook(() => usePublishStory(), { wrapper: Wrapper });
    expect(result.current.mutateAsync).toBeDefined();
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});
