'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { Button } from '@/components/ui/button';
import {
  PanelLeft, PanelRight, PanelBottom, Command,
  Sun, Moon, LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useThemeStore } from '@/stores/theme-store';

export function TopNav() {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const { toggleLeftSidebar, toggleRightPanel, toggleBottomPanel, setCommandPaletteOpen } = useWorkspaceStore();
  const { theme, setTheme } = useThemeStore();

  return (
    <header className="flex h-10 items-center justify-between border-b px-3 bg-background">
      <div className="flex items-center gap-1">
        <span className="text-sm font-bold mr-2">Storynaram</span>
        <Button variant="ghost" size="icon" onClick={toggleLeftSidebar} title="Toggle Sidebar">
          <PanelLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleRightPanel} title="Toggle Right Panel">
          <PanelRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleBottomPanel} title="Toggle Bottom Panel">
          <PanelBottom className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => { setCommandPaletteOpen(true); }} title="Command Palette (Ctrl+P)">
          <Command className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); }} title="Toggle Theme">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        {user && (
          <>
            <span className="text-xs text-muted-foreground mr-1">{user.email}</span>
            <Button variant="ghost" size="icon" onClick={logout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
