# Storynaram

**Story Operating System** — v3.5.0

A monorepo for the Storynaram platform: an AI-powered story IDE with narrative planning, generation, revision, publishing, and rendering engines.

## Repository Structure

```
E:\Storynaram/
├── apps/
│   ├── api/              # Story API (NestJS) — port 3000
│   ├── story-api/        # Story API Platform (NestJS, Phase 9) — port 3002
│   ├── story-studio/     # Story Studio Frontend (Next.js 15) — port 3001
│   ├── worker/           # Background worker (tsx)
│   └── cli/              # CLI tool (tsx)
├── packages/
│   ├── ai/               # AI engines (narrative, generation, revision, publishing)
│   ├── common/           # Shared utilities
│   ├── config/           # Configuration
│   ├── core/             # Core domain kernel
│   ├── events/           # Event system
│   ├── logger/           # Logging
│   └── platform/         # Platform integrations
├── tools/                # Windows batch automation scripts
├── content/              # World-building directories
│   ├── characters/       # Character definitions (scaffold)
│   ├── plots/            # Plot definitions (scaffold)
│   ├── chapters/         # Chapter definitions (scaffold)
│   ├── scenes/           # Scene definitions (scaffold)
│   ├── locations/        # Location definitions (scaffold)
│   ├── books/            # Book definitions (scaffold)
│   ├── world/            # World/geography (scaffold)
│   ├── lore/             # Lore and history (scaffold)
│   ├── timelines/        # Timeline data (scaffold)
│   └── ...               # Additional content directories
```

## Prerequisites

- **Node.js** 22+
- **pnpm** 9+
- **Windows 11** (primary platform)
- **PostgreSQL** (for API data persistence)
- **Redis** (for AI task queues)

## Quick Start

```bash
# Install dependencies
pnpm install

# Start all services (backend + frontend + worker)
tools\run-everything.bat

# Or start individually:
pnpm --filter @storynaram/api dev                    # Story API (port 3000)
pnpm --filter @storynaram/story-studio dev --port 3001 # Studio (port 3001)
pnpm --filter @storynaram/story-api dev               # Platform API (port 3002)
pnpm --filter @storynaram/worker dev                  # Worker
```

## Automation Scripts

Located in `tools/`:

| Script | Purpose |
|--------|---------|
| `run-backend.bat` | Start Story API only |
| `run-frontend.bat` | Start Story Studio only |
| `run-all.bat` | Start backend + frontend in separate windows |
| `run-everything.bat` | Start all services (API, Studio, Platform, Worker) |
| `install.bat` | Fresh dependency installation |
| `build-all.bat` | Build all packages |
| `test-all.bat` | Run all tests |
| `lint-all.bat` | Run linter |
| `typecheck-all.bat` | TypeScript type checking |
| `production-check.bat` | Full pipeline: lint → typecheck → build → test |
| `doctor.bat` | System diagnostics |
| `clean.bat` | Clean build artifacts |
| `stop-all.bat` | Stop all running services |

## NPM Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start API in watch mode |
| `pnpm build` | Build all packages |
| `pnpm typecheck` | Run TypeScript type checking across all packages |
| `pnpm lint` | Run ESLint across the monorepo |
| `pnpm test` | Run all tests |
| `pnpm clean` | Clean all build artifacts |

## Architecture

### Implemented Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 6.1–6.7 | Domain Kernel (Core, Character, World, Timeline, Canon, Narrative, Composition) | ✅ Complete |
| 7.0 | Platform Integration RC1 (21 source, 19 test, 3 bench — all pass) | ✅ Complete |
| 8.0 | AI Narrative Planner (21 source, 10 test, 3 bench — all pass) | ✅ Complete |
| 8.1 | AI Narrative Execution Engine (22 source, 8 test, 4 bench — all pass) | ✅ Complete |
| 8.2 | AI Story Generation Engine (22 source, 10 test, 4 bench — all pass) | ✅ Complete |
| 8.3 | AI Revision Engine (37 source, 6 test, 5 bench — all pass) | ✅ Complete |
| 8.4 | AI Publishing & Rendering Engine (45+ source, 8 test, 5 bench — all pass) | ✅ Complete |
| 9.0 | Story API Platform (133 files — all pass, 0 TS errors) | ✅ Complete |
| 10.0 | Story Studio Frontend (73 source, 41 tests — all pass, build succeeds) | ✅ Complete |

### Domain Packages

- **@storynaram/core** — Domain kernel, entities, value objects, aggregates, repositories
- **@storynaram/common** — Shared utilities, types, constants, enums, interfaces
- **@storynaram/config** — Configuration management, environment validation
- **@storynaram/events** — Event system (NestJS CQRS-based)
- **@storynaram/logger** — Structured logging
- **@storynaram/platform** — Platform integrations (auth, storage, search, websocket)

### AI Packages

- **@storynaram/ai** — All AI engines (narrative, generation, revision, publishing, rendering)
- AI Narrative Planner (Phase 8.0)
- AI Narrative Execution Engine (Phase 8.1)
- AI Story Generation Engine (Phase 8.2)
- AI Revision Engine (Phase 8.3)
- AI Publishing & Rendering Engine (Phase 8.4)

### Applications

- **Story API** (`apps/api`) — NestJS REST API, Swagger docs at `/docs`
- **Story API Platform** (`apps/story-api`) — Domain + AI modules, auth, queues, search, storage
- **Story Studio** (`apps/story-studio`) — Next.js 15 frontend with 16 feature components
- **Worker** (`apps/worker`) — Background task processing
- **CLI** (`apps/cli`) — Command-line tools

## Build Verification

```bash
pnpm lint       # 0 errors, 0 warnings
pnpm typecheck  # 0 errors (all packages)
pnpm build      # Compiles successfully
pnpm test       # All tests pass
```

## Content / World-Building

Content directories under the root are scaffolding for story world-building data:

- **Characters/** — Character definitions (heroes, villains, supporting, etc.)
- **Plots/** — Plot threads, mysteries, twists, endings
- **Chapters/** — Chapter definitions across all books
- **Scenes/** — Individual scene definitions
- **Locations/** — Named locations where scenes occur
- **Books/** — Book-level metadata
- **World/** — World geography and cosmology
- **Lore/** — History and background lore
- **Timeline/** — Chronological event tracking
- **Dialogues/** — Character dialogue records
- **AI/** — AI prompts, workflows, knowledge bases

Each directory contains a `README.md` with naming conventions and schema documentation.
