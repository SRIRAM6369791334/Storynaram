# Compatibility Matrix

## Cross-Category Compatibility

| Category | Core v1.0 | Domain v1.0 | AI v1.0 | Workflow v1.0 | Validation v1.0 |
|----------|:---------:|:-----------:|:-------:|:--------------:|:----------------:|
| Core v1.0 | ✓ | ✓ | ✓ | ✓ | ✓ |
| Domain v1.0 | ✓ (allOf) | ✓ | ~ | ~ | ✓ |
| AI v1.0 | ✓ (BaseAI) | ~ | ✓ | ✓ | ✓ |
| Workflow v1.0 | ✓ (BaseWorkflow) | ~ | ~ | ✓ | ✓ |
| Validation v1.0 | ✓ (BaseValidation) | ✓ | ✓ | ✓ | ✓ |

- ✓ = compatible
- ~ = no direct dependency, interface-based

## Schema-Level Compatibility Rules

- Schemas within the same category and MAJOR version are always compatible.
- Cross-category references must resolve to the declared version. A mismatch requires an adapter layer.
- Optional `$ref` targets may be absent if a consumer does not implement a given category.
- All categories share a single versioning timeline — a MAJOR bump in any category triggers a coordinated release.

## Version Compatibility Table

| Consumer \ Producer | v1.0.x | v1.1.x | v2.0.x | v3.0.x |
|---------------------|:------:|:------:|:------:|:------:|
| v1.0.x              | ✓      | ✓      | ✗      | ✗      |
| v1.1.x              | ✓      | ✓      | ✗      | ✗      |
| v2.0.x              | ~      | ~      | ✓      | ✗      |
| v3.0.x              | ~      | ~      | ~      | ✓      |

- ✓ = directly compatible
- ~ = compatible via migration layer
- ✗ = incompatible
