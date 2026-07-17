# Backward Compatibility

## Rules

| # | Rule | SemVer Impact |
|---|------|---------------|
| 1 | Adding optional properties | Always backward compatible |
| 2 | Adding enum values | Backward compatible (clients should handle unknown values) |
| 3 | Relaxing constraints (widening min, removing pattern) | Backward compatible |
| 4 | Removing optional properties | Breaking change — MAJOR version |
| 5 | Making optional required | Breaking change — MAJOR version |
| 6 | Renaming properties | Breaking change — MAJOR version |
| 7 | Narrowing enums | Breaking change — MAJOR version |
| 8 | Tightening constraints | Potential breaking change — MINOR version with migration guide |
| 9 | Changing `$id` | Breaking change — MAJOR version |
| 10 | Removing `$defs` | Breaking change — MAJOR version |

## Rationale

Backward compatibility ensures that a newer schema producer can serve data that an older consumer can still read. All changes MUST be evaluated against the rules above before inclusion in a release.
