# Version Resolution

## Version Types

| Version Kind | Format | Example | Location |
|-------------|--------|---------|----------|
| Template Version | semver | `1.4.2` | Template frontmatter |
| Schema Version | semver | `2.0.0` | `$schema` field |
| Entity Version | semver | `0.9.0` | Entity document |
| Extension Version | semver | `1.0.0-beta` | Extension manifest |
| Plugin Version | semver | `3.2.1` | Plugin manifest |

## Version Ranges

| Notation | Meaning | Example |
|----------|---------|---------|
| `1.2.3` | Exact match | `1.2.3` |
| `>=1.0.0` | Minimum version | `>=1.0.0` |
| `^1.2.0` | Compatible with 1.x | `^1.2.0` |
| `~1.2.0` | Patch-level compatible | `~1.2.0` |
| `1.0.0 - 2.0.0` | Inclusive range | `1.0.0 - 2.0.0` |
| `*` | Any version | `*` |

## Compatibility Windows

- **Major version mismatch**: Breaking change — requires migration.
- **Minor version mismatch**: Possibly breaking — checked against deprecation policy.
- **Patch version mismatch**: Safe — auto-accepted.

## Deprecation Policy

| Deprecation State | Behavior |
|-------------------|----------|
| `active` | Normal resolution |
| `deprecated` | Warning emitted, still resolves |
| `sunset` | Error unless explicitly opted in |
| `removed` | `MissingDependency` error |

## Resolution Algorithm

1. Collect all version constraints for each dependency.
2. Find the latest version satisfying all constraints.
3. If no version satisfies all constraints → `InvalidVersion` error.
4. If version is `deprecated` → emit warning, proceed.
5. If version is `sunset` → require explicit override.
6. Auto-migration: templates within the same major version may be auto-upgraded.
