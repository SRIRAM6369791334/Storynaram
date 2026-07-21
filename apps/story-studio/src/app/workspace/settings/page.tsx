'use client';

import { useThemeStore } from '@/stores/theme-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-lg font-bold">Settings</h1>
      <Tabs value="general" onValueChange={() => {}}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="ai">AI Models</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Theme</h3>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <Button key={t} variant={theme === t ? 'primary' : 'default'} onClick={() => setTheme(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Language</h3>
            <Input value="English" readOnly />
          </div>
        </TabsContent>

        <TabsContent value="editor" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Auto Save</span>
            <span className="text-sm text-muted-foreground">30s</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Font Size</span>
            <span className="text-sm text-muted-foreground">14px</span>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <p className="text-sm text-muted-foreground">Configure AI model preferences for story generation, revision, and publishing.</p>
          <div className="mt-4 space-y-3">
            <Input label="Default Model" value="gpt-4" readOnly />
            <Input label="Temperature" value="0.7" readOnly />
            <Input label="Max Tokens" value="2048" readOnly />
          </div>
        </TabsContent>

        <TabsContent value="keys" className="mt-4">
          <p className="text-sm text-muted-foreground">Manage your API keys for external services.</p>
        </TabsContent>

        <TabsContent value="shortcuts" className="mt-4 space-y-2">
          {[
            ['Ctrl+P', 'Command Palette'],
            ['Ctrl+S', 'Save'],
            ['Ctrl+Z', 'Undo'],
            ['Ctrl+Shift+Z', 'Redo'],
            ['Ctrl+B', 'Toggle Sidebar'],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between py-1">
              <span className="text-sm">{desc}</span>
              <kbd className="rounded border bg-muted px-2 py-0.5 text-xs">{key}</kbd>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
