'use client';

import { AuthGuard } from '@/providers/auth-guard';
import { TopNav } from '@/components/layout/topnav';
import { Sidebar, SidebarPanel } from '@/components/layout/sidebar';
import { RightPanel } from '@/components/layout/right-panel';
import { BottomPanel } from '@/components/layout/bottom-panel';
import { Dock } from '@/components/layout/dock';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { cn } from '@/utils/cn';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { showLeftSidebar, showRightPanel, showBottomPanel, panelSizes } = useWorkspaceStore();

  return (
    <AuthGuard>
      <div className="flex h-screen flex-col overflow-hidden">
        <TopNav />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <PanelGroup direction="horizontal" autoSaveId="workspace-horizontal">
            {showLeftSidebar && (
              <>
                <Panel defaultSize={20} minSize={15} maxSize={30}>
                  <SidebarPanel />
                </Panel>
                <PanelResizeHandle className="w-1 bg-border hover:bg-primary/20 transition-colors" />
              </>
            )}
            <Panel defaultSize={showLeftSidebar ? 60 : 85} minSize={30}>
              <div className="flex h-full flex-col">
                <Dock />
                <PanelGroup direction="vertical" autoSaveId="workspace-vertical">
                  <Panel defaultSize={showBottomPanel ? 70 : 100} minSize={30}>
                    <main className="h-full overflow-auto">{children}</main>
                  </Panel>
                  {showBottomPanel && (
                    <>
                      <PanelResizeHandle className="h-1 bg-border hover:bg-primary/20 transition-colors" />
                      <Panel defaultSize={30} minSize={15} maxSize={50}>
                        <BottomPanel />
                      </Panel>
                    </>
                  )}
                </PanelGroup>
              </div>
            </Panel>
            {showRightPanel && (
              <>
                <PanelResizeHandle className="w-1 bg-border hover:bg-primary/20 transition-colors" />
                <Panel defaultSize={25} minSize={20} maxSize={40}>
                  <RightPanel />
                </Panel>
              </>
            )}
          </PanelGroup>
        </div>
      </div>
    </AuthGuard>
  );
}
