# Schema Versioning Policy

All Storynaram schemas follow **Semantic Versioning 2.0.0** as defined at [semver.org](https://semver.org).

## Version Format

```
{MAJOR}.{MINOR}.{PATCH}
```

Version numbers are stored in schema metadata under the `version` property in the schema's `$comment` or dedicated `x-storynaram` extension field.

## Version Bump Rules

### MAJOR — Breaking Changes

Increment the MAJOR version when a change is **not backward compatible**. Examples:

- Removing or renaming a property
- Changing a property's type
- Adding a `required` property
- Narrowing an `enum` (removing values)
- Changing an existing `$ref` target to an incompatible schema
- Restructuring a `oneOf`/`anyOf`/`allOf` in a way that invalidates existing documents

### MINOR — Backward-Compatible Additions

Increment the MINOR version when adding new functionality that does not break existing consumers. Examples:

- Adding a new optional property
- Adding new values to an `enum`
- Relaxing a constraint (e.g., widening a pattern or removing a `required`)
- Adding new `$ref` targets alongside existing ones
- Adding `examples` or `default` values

### PATCH — Bug Fixes

Increment the PATCH version for changes that fix errors without altering the schema contract. Examples:

- Clarifying `description` or `title`
- Tightening a constraint that does not invalidate any existing valid document
- Fixing a JSON Schema structural error (e.g., misplaced keyword)
- Updating documentation or metadata

## Pre-release Tags

Pre-release versions follow the format `{MAJOR}.{MINOR}.{PATCH}-{TAG}`.

| Tag | Purpose |
|-----|---------|
| `-alpha.N` | Early development, may be incomplete; breaking changes allowed within alpha. |
| `-beta.N` | Feature-complete, testing phase; only bug fixes expected. |
| `-rc.N` | Release candidate; final validation before stable release. |

Pre-release versions have **lower precedence** than the equivalent normal version.

## Independent Versioning

All 5 schema categories version independently:

| Category | Version tracked in |
|----------|-------------------|
| Core | `registry/core-registry.json` |
| Entity | `registry/entity-registry.json` |
| State | `registry/state-registry.json` |
| Narrative | `registry/narrative-registry.json` |
| Media | `registry/media-registry.json` |

A MAJOR bump in one category does **not** require a MAJOR bump in dependent categories unless the dependency contract breaks.

## Compatibility Documentation

Cross-category version compatibility is documented in:

```
schemas/governance/COMPATIBILITY_MATRIX.md
```

Every version change must update the compatibility matrix to reflect new compatibility boundaries.

## Version Lifecycle

- When a schema enters `draft`, version starts at `0.1.0`.
- When promoted to `experimental`, version is `0.{N}.0` (N >= 1).
- When promoted to `stable`, version is `1.0.0`.
- Deprecation and archival do not change the version number but record the deprecation version in the registry.
