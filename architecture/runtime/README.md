# Runtime Technology Architecture

**Version:** 1.0.0
**Status:** Architecture Blueprint (Pre-Implementation)
**Stack:** NestJS 11 + TypeScript 5.x + Node.js 22 LTS

## Purpose

This document set defines the complete technology architecture for the Storynaram Runtime. It is the implementation blueprint for Phase 4+ — every controller, service, module, and deployment decision is guided by these documents.

## Document Catalog

| Document | Purpose |
|----------|---------|
| RUNTIME_ARCHITECTURE.md | Top-level runtime architecture overview |
| MONOREPO_GUIDE.md | Workspace layout, package boundaries |
| MODULE_GUIDE.md | NestJS module design and responsibilities |
| PACKAGE_GUIDE.md | Shared library package design |
| DEPENDENCY_RULES.md | Architectural dependency constraints |
| EVENT_ARCHITECTURE.md | Domain and system event design |
| PLUGIN_ARCHITECTURE.md | Plugin system design and lifecycle |
| CONFIGURATION_GUIDE.md | Configuration strategy and precedence |
| ERROR_HANDLING_GUIDE.md | Error hierarchy and recovery |
| LOGGING_GUIDE.md | Structured logging and observability |
| TESTING_GUIDE.md | Testing strategy and architecture |
| BUILD_RELEASE_GUIDE.md | Build pipeline and release workflow |
| SECURITY_GUIDE.md | Security architecture |
| IMPLEMENTATION_GUIDE.md | Phase 4 implementation roadmap |

## Technology Decisions

| Concern | Decision | Rationale |
|---------|----------|-----------|
| Language | TypeScript 5.x strict | Type safety across full stack |
| Runtime | Node.js 22 LTS | Long-term support, ESM |
| Framework | NestJS 11 | Modularity, DI, decorators |
| Package Manager | pnpm | Fast, strict, workspace-native |
| Monorepo | pnpm workspace | Native, no additional tooling |
| Database ORM | Prisma | Type-safe, migration, schema-first |
| Validation (schema) | AJV | Draft 2020-12, $ref resolution |
| Validation (DTO) | Zod | Runtime-safe, composable |
| Cache | Redis | Distributed, pub/sub, bullMQ backing |
| Queue | BullMQ | Redis-backed, robust |
| Storage | S3-compatible | MinIO / AWS S3 / Cloudflare R2 |
| Logging | Pino | Fast, structured |
| Monitoring | OpenTelemetry | Vendor-neutral, traces+metrics |
| API Docs | OpenAPI 3.1 + Swagger | Auto-generated from NestJS decorators |
| Testing | Vitest + Supertest | Fast ESM-native test runner |
| E2E | Playwright | Browser + API testing |
