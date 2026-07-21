import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimelineGraph } from '../src/features/visual-editors/timeline-graph';
import { CharacterGraph } from '../src/features/visual-editors/character-graph';
import { WorldMap } from '../src/features/visual-editors/world-map';
import { CompositionGraph } from '../src/features/visual-editors/composition-graph';

describe('TimelineGraph', () => {
  it('shows empty state when no events', () => {
    render(<TimelineGraph />);
    expect(screen.getByText('Add events to see the timeline graph')).toBeInTheDocument();
  });

  it('renders canvas with events', () => {
    const events = [
      { id: '1', title: 'Event 1', date: '2024-01' },
      { id: '2', title: 'Event 2', date: '2024-02' },
    ];
    const { container } = render(<TimelineGraph events={events} />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
    expect(screen.queryByText('Add events to see the timeline graph')).not.toBeInTheDocument();
  });
});

describe('CharacterGraph', () => {
  it('shows empty state when no characters', () => {
    render(<CharacterGraph />);
    expect(screen.getByText('Add characters to see the relationship graph')).toBeInTheDocument();
  });

  it('renders canvas with characters', () => {
    const characters = [
      { id: '1', name: 'Alice', role: 'protagonist' },
      { id: '2', name: 'Bob', role: 'antagonist' },
    ];
    const { container } = render(<CharacterGraph characters={characters} />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
    expect(screen.queryByText('Add characters to see the relationship graph')).not.toBeInTheDocument();
  });
});

describe('WorldMap', () => {
  it('shows empty state when no locations', () => {
    render(<WorldMap />);
    expect(screen.getByText('Add locations to see the world map')).toBeInTheDocument();
  });

  it('renders canvas with locations', () => {
    const locations = [
      { id: '1', name: 'Forest', x: 20, y: 30, type: 'region' },
    ];
    const { container } = render(<WorldMap locations={locations} />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
    expect(screen.queryByText('Add locations to see the world map')).not.toBeInTheDocument();
  });
});

describe('CompositionGraph', () => {
  it('shows empty state when no scenes', () => {
    render(<CompositionGraph />);
    expect(screen.getByText('Add scenes to see the composition graph')).toBeInTheDocument();
  });

  it('renders canvas with scenes', () => {
    const scenes = [
      { id: '1', title: 'Scene 1', chapter: 1 },
      { id: '2', title: 'Scene 2', chapter: 1 },
    ];
    const { container } = render(<CompositionGraph scenes={scenes} />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
    expect(screen.queryByText('Add scenes to see the composition graph')).not.toBeInTheDocument();
  });
});
