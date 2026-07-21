import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkspaceStore } from '../src/stores/workspace-store';
import { useThemeStore } from '../src/stores/theme-store';

describe('workspace store', () => {
  beforeEach(() => {
    useWorkspaceStore.setState({ tabs: [], activeTabId: null });
  });

  it('opens a tab', () => {
    const store = useWorkspaceStore.getState();
    store.openTab({ id: 'test-1', title: 'Test', type: 'story' });

    const state = useWorkspaceStore.getState();
    expect(state.tabs).toHaveLength(1);
    expect(state.activeTabId).toBe('test-1');
  });

  it('does not duplicate tabs', () => {
    const store = useWorkspaceStore.getState();
    store.openTab({ id: 'test-1', title: 'Test', type: 'story' });
    store.openTab({ id: 'test-1', title: 'Test', type: 'story' });

    expect(useWorkspaceStore.getState().tabs).toHaveLength(1);
  });

  it('closes a tab', () => {
    const store = useWorkspaceStore.getState();
    store.openTab({ id: 'tab-1', title: 'Tab 1', type: 'story' });
    store.openTab({ id: 'tab-2', title: 'Tab 2', type: 'character' });
    store.closeTab('tab-1');

    const state = useWorkspaceStore.getState();
    expect(state.tabs).toHaveLength(1);
    expect(state.tabs[0]?.id).toBe('tab-2');
  });

  it('toggles sidebar', () => {
    const initial = useWorkspaceStore.getState().showLeftSidebar;
    useWorkspaceStore.getState().toggleLeftSidebar();
    expect(useWorkspaceStore.getState().showLeftSidebar).toBe(!initial);
  });
});

describe('theme store', () => {
  it('sets theme', () => {
    useThemeStore.getState().setTheme('light');
    expect(useThemeStore.getState().theme).toBe('light');
  });
});
