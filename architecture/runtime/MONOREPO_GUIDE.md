# Monorepo Guide

## Workspace Layout

```
storynaram/
├── apps/
│   ├── api/                    # NestJS REST API application
│   ├── cli/                    # Command-line tooling
│   └── worker/                 # Background job worker
├── packages/
│   ├── core/                   # Domain entities, value objects
│   ├── runtime/                # Runtime engine orchestration
│   ├── registry/               # Schema registry service
│   ├── schemas/                # JSON Schema files (compiled)
│   ├── validation/             # Validation engine
│   ├── workflow/               # Workflow state machine
│   ├── ai/                     # AI runtime engine
│   ├── storage/                # Storage abstraction
│   ├── plugin-sdk/             # Plugin development kit
│   ├── common/                 # Shared utilities
│   ├── config/                 # Configuration management
│   ├── logger/                 # Structured logging
│   ├── events/                 # Event bus and definitions
│   ├── telemetry/              # OpenTelemetry integration
│   └── testing/                # Test utilities and fixtures
├── plugins/                    # Third-party plugins
├── tools/                      # Build and dev tooling
└── docs/                       # Additional documentation

pnpm-workspace.yaml
tsconfig.base.json
package.json
```

## Package Responsibilities

| Package | Responsibility | Depends On |
|---------|---------------|------------|
| `@storynaram/core` | Domain entities, value objects, domain events, repository interfaces | — |
| `@storynaram/runtime` | Engine orchestration, bootstrap, lifecycle | core, registry, validation, workflow, ai |
| `@storynaram/registry` | Schema registry loading, querying, caching | core, common, events |
| `@storynaram/schemas` | Compiled JSON Schema files as runtime module | — |
| `@storynaram/validation` | Schema + business rule validation | core, registry, common |
| `@storynaram/workflow` | State machine execution, transitions | core, registry, common, events |
| `@storynaram/ai` | AI context, prompt, reasoning | core, registry, common, events |
| `@storynaram/storage` | S3-compatible document storage | common |
| `@storynaram/plugin-sdk` | Plugin interface definitions, base classes | core, common, events |
| `@storynaram/common` | Shared types, utilities, guards, pipes | — |
| `@storynaram/config` | Configuration loading, validation, env | common |
| `@storynaram/logger` | Pino structured logger | config |
| `@storynaram/events` | Event bus, message types | common |
| `@storynaram/telemetry` | OpenTelemetry setup and utilities | config |

## pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "plugins/*"
```

## Dependency Rules

- Apps depend on packages (never vice versa)
- Packages depend on packages (allowed within rules)
- Plugins depend on plugin-sdk only
- No circular package dependencies
- Core package has zero runtime dependencies
