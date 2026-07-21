import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Tab {
  id: string;
  title: string;
  type: 'story' | 'character' | 'world' | 'timeline' | 'canon' | 'narrative' | 'composition' | 'publishing' | 'publication' | 'ai';
  entityId?: string;
  isDirty?: boolean;
}

interface PanelSize {
  left: number;
  right: number;
  bottom: number;
}

interface WorkspaceState {
  activeTabId: string | null;
  tabs: Tab[];
  panelSizes: PanelSize;
  showLeftSidebar: boolean;
  showRightPanel: boolean;
  showBottomPanel: boolean;
  activeLeftView: string;
  isCommandPaletteOpen: boolean;
  openTab: (tab: Tab) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  setPanelSizes: (sizes: Partial<PanelSize>) => void;
  toggleLeftSidebar: () => void;
  toggleRightPanel: () => void;
  toggleBottomPanel: () => void;
  setActiveLeftView: (view: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      activeTabId: null,
      tabs: [],
      panelSizes: { left: 260, right: 320, bottom: 200 },
      showLeftSidebar: true,
      showRightPanel: false,
      showBottomPanel: false,
      activeLeftView: 'explorer',
      isCommandPaletteOpen: false,
      openTab: (tab) => {
        const { tabs } = get();
        const existing = tabs.find((t) => t.id === tab.id);
        if (existing) {
          set({ activeTabId: tab.id });
          return;
        }
        set({ tabs: [...tabs, tab], activeTabId: tab.id });
      },
      closeTab: (id) => {
        const { tabs, activeTabId } = get();
        const newTabs = tabs.filter((t) => t.id !== id);
        let newActive = activeTabId;
        if (activeTabId === id) {
          const idx = tabs.findIndex((t) => t.id === id);
          newActive = newTabs[Math.min(idx, newTabs.length - 1)]?.id ?? null;
        }
        set({ tabs: newTabs, activeTabId: newActive });
      },
      setActiveTab: (id) => set({ activeTabId: id }),
      setPanelSizes: (sizes) => set((s) => ({ panelSizes: { ...s.panelSizes, ...sizes } })),
      toggleLeftSidebar: () => set((s) => ({ showLeftSidebar: !s.showLeftSidebar })),
      toggleRightPanel: () => set((s) => ({ showRightPanel: !s.showRightPanel })),
      toggleBottomPanel: () => set((s) => ({ showBottomPanel: !s.showBottomPanel })),
      setActiveLeftView: (view) => set({ activeLeftView: view }),
      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
    }),
    { name: 'storynaram-workspace', partialize: (state) => ({ panelSizes: state.panelSizes, showLeftSidebar: state.showLeftSidebar }) },
  ),
);
