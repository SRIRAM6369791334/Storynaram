# @storynaram/story-studio

**Story Studio** — AI-Powered Story IDE frontend.

Built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v3, and shadcn/ui.

## Getting Started

```bash
pnpm dev       # Start dev server on port 3001
pnpm build     # Production build
pnpm test      # Run tests (41 tests, 7 files)
pnpm lint      # ESLint (0 errors, 0 warnings)
pnpm typecheck # TypeScript (0 errors)
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/workspace` |
| `/login` | Sign in page |
| `/workspace` | Main workspace (tabs, sidebar, panels) |
| `/workspace/settings` | Settings (theme, editor, API keys) |
| `/workspace/stories/[id]` | Story detail page |

## Feature Components (16)

- AiChat, LoginForm, CommandPalette, SettingsPage
- StoryList, CharacterList, WorldBuilder, TimelineEditor
- CanonManager, NarrativePlanner, CompositionEditor, PublishingManager
- CharacterGraph, TimelineGraph, WorldMap, CompositionGraph (Canvas-based visual editors)

## UI Components (14)

- Button, Input, Dialog, Tabs, Badge, Skeleton, Toast
- Sidebar, TopNav, Dock, BottomPanel, RightPanel
- StoryEditor, EmptyState, AuthGuard

## Hooks (12)

- use-auth, use-stories, use-characters, use-worlds, use-timelines
- use-canon, use-narratives, use-compositions, use-publishing, use-ai
- use-canvas, use-debounce, use-keyboard

## Stores (3)

- `auth-store` — Authentication state (Zustand + persist)
- `workspace-store` — Workspace tabs, panels, sidebar (Zustand + persist)
- `theme-store` — Theme preference (dark/light/system)

## Services (12)

- api-client (token refresh, retry logic)
- auth, stories, characters, worlds, timelines
- canon, narratives, compositions, publishing, ai, search

## Architecture

- **App Router** with client components (`'use client'`)
- **TanStack Query v5** for server state
- **Zustand v5** with persist middleware for client state
- **Socket.IO** for real-time updates
- **Framer Motion** for animations
- **react-resizable-panels** for workspace layout
- **Radix UI** primitives for accessible components

## Production Status

```bash
pnpm lint       # 0 errors, 0 warnings
pnpm typecheck  # 0 errors
pnpm build      # Compiled successfully (7 static pages)
pnpm test       # 41 tests, all passing
```
