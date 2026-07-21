'use client';

import { useState } from 'react';
import { useThemeStore } from '@/stores/theme-store';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { Bell, Eye, Key, LogOut, Palette, RefreshCw, Shield, User } from 'lucide-react';

export function SettingsPage() {
  const { theme, setTheme } = useThemeStore();
  const { user } = useAuthStore();
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account and application preferences.</p>
      </div>

      <section className="space-y-4">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <User className="h-4 w-4" /> Profile
        </h3>
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Email</span>
            <span className="text-sm text-muted-foreground">{user?.email ?? 'Not signed in'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Roles</span>
            <div className="flex gap-1">
              {user?.roles.map((r) => <Badge key={r} variant="default">{r}</Badge>)}
              {!user?.roles.length && <span className="text-xs text-muted-foreground">None</span>}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Palette className="h-4 w-4" /> Appearance
        </h3>
        <div className="border rounded-lg p-4">
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <Button key={t} size="sm" variant={theme === t ? 'primary' : 'secondary'} onClick={() => { setTheme(t); }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Eye className="h-4 w-4" /> Editor
        </h3>
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Font size</p>
              <p className="text-xs text-muted-foreground">Adjust editor text size</p>
            </div>
            <Input type="number" className="w-20" defaultValue={16} min={12} max={24} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Auto-save</p>
              <p className="text-xs text-muted-foreground">Automatically save changes</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Key className="h-4 w-4" /> API Keys
        </h3>
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">AI API Key</p>
              <p className="text-xs text-muted-foreground">For AI-powered features</p>
            </div>
            <div className="flex items-center gap-2">
              <Input type={showKey ? 'text' : 'password'} className="w-48" placeholder="sk-..." value="sk-••••••••••" readOnly />
              <Button size="sm" variant="ghost" onClick={() => { setShowKey(!showKey); }}>
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => toast.success('API key rotated')}>
            <RefreshCw className="h-3 w-3 mr-1" /> Rotate Key
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Bell className="h-4 w-4" /> Notifications
        </h3>
        <div className="border rounded-lg p-4 space-y-3">
          {[
            { label: 'Publication ready', key: 'publish' },
            { label: 'AI generation complete', key: 'ai' },
            { label: 'Collaboration invites', key: 'collab' },
          ].map(({ label, key }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium flex items-center gap-2 text-red-500">
          <Shield className="h-4 w-4" /> Danger Zone
        </h3>
        <div className="border border-red-200 rounded-lg p-4">
          <Button variant="secondary" className="text-red-500 border-red-200" onClick={() => toast.success('Logged out')}>
            <LogOut className="h-3 w-3 mr-1" /> Sign Out
          </Button>
        </div>
      </section>
    </div>
  );
}
