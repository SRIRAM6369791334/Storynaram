# Implementation Guide — Phase 4 Roadmap

## Phase 4 Overview

Phase 4 translates the schema foundation and runtime blueprint into running NestJS services. All implementation is guided by the architecture documents in this directory.

## Phase 4 Sub-Phases

### Phase 4.1 — Monorepo Bootstrap (Week 1)

- Initialize pnpm workspace
- Create tsconfig.base.json with strict mode
- Create ESLint + Prettier config
- Create Vitest config
- Scaffold all package directories with package.json
- Create CI pipeline (GitHub Actions)
- Verify dependency rules with madge

### Phase 4.2 — Foundation Packages (Weeks 2-3)

- `@storynaram/common` — types, utilities, guards
- `@storynaram/config` — env loading, validation
- `@storynaram/logger` — Pino integration, correlation IDs
- `@storynaram/events` — Event bus interface, in-memory implementation
- `@storynaram/telemetry` — OpenTelemetry setup

### Phase 4.3 — Core + Schema Packages (Weeks 3-5)

- `@storynaram/core` — Domain entity types, repository interfaces
- `@storynaram/registry` — Schema registry loading, caching
- `@storynaram/schemas` — Compiled JSON Schema package
- `@storynaram/validation` — AJV wrapper, validation engine

### Phase 4.4 — Engine Packages (Weeks 5-8)

- `@storynaram/runtime` — Engine orchestration, lifecycle
- `@storynaram/workflow` — State machine engine
- `@storynaram/ai` — AI context/prompt/reasoning engine
- `@storynaram/storage` — S3 storage abstraction

### Phase 4.5 — API Application (Weeks 8-10)

- NestJS `apps/api/` bootstrap
- CoreModule, ConfigModule, LoggerModule
- Entity CRUD controller for domain types
- Schema-based validation pipes
- OpenAPI documentation generation
- Error handling (GlobalExceptionFilter)

### Phase 4.6 — Plugin System (Weeks 10-11)

- `@storynaram/plugin-sdk` — Plugin interfaces, base class
- `@storynaram/plugin` — Plugin host module
- Plugin discovery and loading
- Plugin sandbox and permissions

### Phase 4.7 — Worker + CLI (Weeks 11-12)

- `apps/worker/` — BullMQ job processing
- `apps/cli/` — Command-line operations (import, validate, migrate)
- Health check endpoints
- Graceful shutdown

## Implementation Order Dependencies

```
common → config → logger → events → telemetry
                                              ↓
                     core → registry → schemas → validation
                                                      ↓
                                  runtime ← workflow ← ai → storage
                                      ↓
                                   apps/api ← plugin ← apps/worker
                                                      ↓
                                                   apps/cli
```

## Quality Gates Per Phase

| Gate | Requirement |
|------|-------------|
| Lint pass | 0 ESLint errors |
| Type check | 0 TypeScript errors (strict) |
| Tests pass | 100% of tests |
| Coverage | 80%+ line coverage |
| Build | `pnpm build` succeeds |
| Dep check | 0 circular dependencies |
| Schema check | All $refs resolve |
