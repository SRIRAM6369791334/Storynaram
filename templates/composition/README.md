# Template Composition Engine

## Purpose

The Template Composition Engine is the architectural specification for how every Storynaram entity is assembled from base templates, domain templates, and extension plugins. It is the single source of truth for inheritance, composition, merge, override, dependency resolution, validation, and extension loading.

## Design Principles

- **Composition over inheritance** — Entities are assembled from reusable blocks
- **Explicit inheritance** — Every template declares exactly what it inherits
- **Deterministic merge** — Given the same inputs, the same entity is always produced
- **Fail fast** — Invalid compositions are detected at assembly time
- **Extensible by design** — Plugins extend without modifying core templates
- **Versioned everywhere** — Every template and composition has explicit versioning

## Documents

| # | Document | Description |
|---|----------|-------------|
| 1 | [COMPOSITION_ENGINE.md](COMPOSITION_ENGINE.md) | High-level architecture overview |
| 2 | [COMPOSITION_PIPELINE.md](COMPOSITION_PIPELINE.md) | End-to-end assembly pipeline |
| 3 | [INHERITANCE_MODEL.md](INHERITANCE_MODEL.md) | Single inheritance + multiple composition |
| 4 | [MERGE_STRATEGY.md](MERGE_STRATEGY.md) | Object, array, and primitive merge rules |
| 5 | [OVERRIDE_RULES.md](OVERRIDE_RULES.md) | Field-level override precedence |
| 6 | [DEPENDENCY_RESOLUTION.md](DEPENDENCY_RESOLUTION.md) | Load order and dependency graph |
| 7 | [VALIDATION_PIPELINE.md](VALIDATION_PIPELINE.md) | Multi-stage validation sequence |
| 8 | [EXTENSION_SYSTEM.md](EXTENSION_SYSTEM.md) | Extension point architecture |
| 9 | [PLUGIN_COMPOSITION.md](PLUGIN_COMPOSITION.md) | Plugin integration model |
| 10 | [VERSION_RESOLUTION.md](VERSION_RESOLUTION.md) | Template and schema versioning |
| 11 | [COMPATIBILITY_RULES.md](COMPATIBILITY_RULES.md) | Forward/backward compatibility |
| 12 | [CONFLICT_RESOLUTION.md](CONFLICT_RESOLUTION.md) | Conflict detection and resolution |
| 13 | [COMPOSITION_CONTEXT.md](COMPOSITION_CONTEXT.md) | Runtime context model |
| 14 | [TEMPLATE_LOADING.md](TEMPLATE_LOADING.md) | Template loading and caching |
| 15 | [PIPELINE_STAGES.md](PIPELINE_STAGES.md) | Detailed pipeline stage specifications |
| 16 | [ERROR_HANDLING.md](ERROR_HANDLING.md) | Error model and error handling |
| 17 | [BEST_PRACTICES.md](BEST_PRACTICES.md) | Best practices for template authors |
| 18 | [PERFORMANCE_GUIDELINES.md](PERFORMANCE_GUIDELINES.md) | Performance targets and guidelines |
| 19 | [SECURITY_MODEL.md](SECURITY_MODEL.md) | Security considerations |
| 20 | [TESTING_GUIDELINES.md](TESTING_GUIDELINES.md) | Testing strategy and guidelines |
| 21 | [CHANGE_MANAGEMENT.md](CHANGE_MANAGEMENT.md) | Change management and migration |

## Pipeline Overview

```mermaid
graph LR
    LT[Load Templates] --> RD[Resolve Dependencies]
    RD --> CM[Compose/Merge]
    CM --> VO[Validate Overrides]
    VO --> VP[Validate Pipeline]
    VP --> RR[Resolve References]
    RR --> FE[Finalize Entity]

    style LT fill:#1a1a2e,stroke:#e94560,color:#fff
    style FE fill:#16213e,stroke:#0f3460,color:#fff
```

## Registry Files

All registries reside in `templates/registry/`:

| Registry | Purpose |
|----------|---------|
| `template-registry.json` | All registered templates |
| `entity-registry.json` | All registered entity types |
| `inheritance-registry.json` | Inheritance tree |
| `relationship-registry.json` | Entity relationships |
| `version-registry.json` | Version tracking |
| `dependency-registry.json` | Dependency graph |
| `extension-registry.json` | Extension points |
| `validation-registry.json` | Validation rules |
| `plugin-registry.json` | Plugin catalog |
| `composition-registry.json` | Composition cache |

## Scale Targets

- 100+ template types
- 500+ plugins
- 1,000,000+ entities
- < 100ms composition time per entity
- < 10ms validation time per entity
