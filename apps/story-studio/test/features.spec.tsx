import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { WorldBuilder } from '../src/features/world/world-builder';
import { TimelineEditor } from '../src/features/timeline/timeline-editor';
import { CanonManager } from '../src/features/canon/canon-manager';
import { NarrativePlanner } from '../src/features/narrative/narrative-planner';
import { CompositionEditor } from '../src/features/composition/composition-editor';
import { PublishingManager } from '../src/features/publishing/publishing-manager';
import { SettingsPage } from '../src/features/settings/settings-page';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
function Wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('WorldBuilder', () => {
  it('renders loading skeleton then content', () => {
    const { container } = render(<WorldBuilder />, { wrapper: Wrapper });
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});

describe('TimelineEditor', () => {
  it('renders loading skeleton then content', () => {
    const { container } = render(<TimelineEditor />, { wrapper: Wrapper });
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});

describe('CanonManager', () => {
  it('renders loading skeleton then content', () => {
    const { container } = render(<CanonManager />, { wrapper: Wrapper });
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});

describe('NarrativePlanner', () => {
  it('renders loading skeleton then content', () => {
    const { container } = render(<NarrativePlanner />, { wrapper: Wrapper });
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});

describe('CompositionEditor', () => {
  it('renders loading skeleton then content', () => {
    const { container } = render(<CompositionEditor />, { wrapper: Wrapper });
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});

describe('PublishingManager', () => {
  it('renders loading skeleton then content', () => {
    const { container } = render(<PublishingManager />, { wrapper: Wrapper });
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});

describe('SettingsPage', () => {
  it('renders settings sections', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
  });
});
