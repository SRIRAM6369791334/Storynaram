# Runtime Architecture

## System Context

The Storynaram Runtime is a modular, event-driven backend platform built on NestJS. It ingests schema definitions (118 JSON Schemas + 121 templates), validates entities against those schemas, manages workflow state machines, orchestrates AI interactions, and serves data via REST/GraphQL APIs.

## Layer Architecture

```
┌─────────────────────────────────────────────────────┐
│                   API Layer                          │
│  REST Controllers  │  GraphQL Resolvers  │  CLI      │
├─────────────────────────────────────────────────────┤
│                 Application Layer                     │
│  Services  │  Commands  │  Queries  │  Use Cases     │
├─────────────────────────────────────────────────────┤
│                   Domain Layer                        │
│  Entities  │  Value Objects  │  Domain Events       │
│  Aggregates  │  Repositories  │  Domain Services    │
├─────────────────────────────────────────────────────┤
│               Runtime Infrastructure                  │
│  Schema Engine  │  Validation Engine  │  Workflow    │
│  AI Engine  │  Registry  │  Plugin Host             │
├─────────────────────────────────────────────────────┤
│              Technical Infrastructure                 │
│  Database  │  Cache  │  Queue  │  Storage  │  Logs   │
└─────────────────────────────────────────────────────┘
```

## Runtime Lifecycle

1. **Bootstrap** — NestJS application initialization
2. **Registry Load** — Schema registries loaded into memory
3. **Plugin Discovery** — Plugins discovered and loaded
4. **Engine Initialization** — Schema, validation, workflow, AI engines
5. **Service Registration** — Domain services registered
6. **API Binding** — Controllers bound to HTTP/GraphQL
7. **Health Check** — All dependencies verified
8. **Serving** — Accepting requests
9. **Graceful Shutdown** — Drain connections, complete work, persist state

## Core Abstractions

| Abstraction | Purpose |
|-------------|---------|
| EntityService<T> | CRUD operations for any entity type |
| SchemaValidator | JSON Schema Draft 2020-12 validation |
| ValidationEngine | Rule-based validation execution |
| WorkflowEngine | State machine orchestration |
| AIEngine | Context, prompt, reasoning orchestration |
| RegistryService | Schema and metadata registry |
| PluginHost | Plugin lifecycle management |
| EventBus | Domain and system event routing |
| StorageService | Document and asset storage |
| CacheService | Distributed caching |
| QueueService | Background job processing |

## Design Principles

1. **Schema-driven** — All data shapes defined by JSON Schema
2. **Domain-first** — Business logic in domain layer, not infrastructure
3. **Event-driven** — Loose coupling via domain events
4. **Plugin-native** — Everything extensible via plugins
5. **Observable-by-default** — Structured logging + metrics + traces
6. **Fail-fast** — Validate at boundaries, handle gracefully inside
7. **Stateless** — Horizontal scale, state in DB/cache/queue
