# Storynaram Schema Governance

## Purpose

The Schema Governance layer is the central authority for all 118 schemas across 5 categories. It defines the rules, roles, and processes by which schemas are created, reviewed, versioned, released, maintained, and retired.

## Governance Principles

| Principle | Description |
|-----------|-------------|
| **Single Source of Truth** | Every schema entity has exactly one authoritative definition. All consumers reference the canonical schema via its `$id`. |
| **Backward Compatibility** | Within a MAJOR version, schemas must not break existing consumers. Breaking changes require a MAJOR version bump. |
| **Semantic Versioning** | All schemas follow SemVer 2.0.0 as defined in VERSION_POLICY.md. |
| **Peer Review** | No schema reaches `stable` without passing through peer, architecture, and security reviews. |
| **Automated Validation** | Every schema change must pass the validation pipeline before merge. |

## Schema Lifecycle States

```
draft → experimental → stable → deprecated → archived
```

Each state carries distinct stability guarantees, change policies, and documentation requirements. See SCHEMA_LIFECYCLE.md for full details.

## Roles

| Role | Responsibility |
|------|---------------|
| **Schema Owner** | Accountable for schema correctness, roadmap, and consumer communication. |
| **Schema Steward** | Day-to-day custodian; implements changes, maintains documentation, shepherds RFCs. |
| **Review Board** | Cross-functional team that approves schema changes at each lifecycle transition. |
| **Release Manager** | Orchestrates version bumps, registry updates, compatibility matrix changes, and release notes. |

## Process Overview

```
Propose → Review → Approve → Release → Maintain → Deprecate
```

Detailed process steps are described in CHANGE_MANAGEMENT.md.

## Tools

| Tool | Purpose |
|------|---------|
| **Registry files** | JSON registries in `schemas/registry/` list all schemas by category. |
| **Validation pipeline** | CI pipeline enforcing schema correctness, reference resolution, and compatibility. |
| **Compatibility matrix** | `COMPATIBILITY_MATRIX.md` tracks version compatibility across all schema categories. |
| **Dependency graph** | Dependency registries map cross-schema references for impact analysis. |

## Category Coverage

The governance layer applies to all schemas in these five categories:

1. **Core** — Foundational type system and base entity definitions
2. **Entity** — Domain entities (Characters, Items, Locations, etc.)
3. **State** — State machine definitions, transitions, and conditions
4. **Narrative** — Narrative structures, beats, acts, and story graphs
5. **Media** — Media assets, rendering data, and presentation metadata
