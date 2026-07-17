# Error Handling

## Standard Error Types

| Error Code | Error Type | Stage | Description |
|------------|-----------|-------|-------------|
| `E001` | `MissingTemplate` | 1 | Template file not found |
| `E002` | `InvalidInheritance` | 2 | Parent missing or circular chain |
| `E003` | `MissingDependency` | 3 | Required dependency unavailable |
| `E004` | `CircularDependency` | 3 | Cycle detected in dependency graph |
| `E005` | `InvalidVersion` | 3 | No version satisfies constraints |
| `E006` | `MergeConflict` | 4 | Incompatible data types during merge |
| `E007` | `InvalidOverride` | 5 | Final/protected field violation |
| `E008` | `MissingRequiredField` | 6 | Required field absent after merge |
| `E009` | `ValidationFailure` | 7 | Type/range/pattern check failed |
| `E010` | `RelationshipConflict` | 8 | Reference to nonexistent entity |
| `E011` | `DuplicateIdentifier` | 8 | Duplicate `$id` detected |
| `E012` | `BusinessRuleViolation` | 9 | Domain logic constraint violated |
| `E013` | `AISemanticIssue` | 10 | Semantic inconsistency detected |
| `E014` | `ExtensionConflict` | 4 | Two extensions target same field |
| `E015` | `CompositionTimeout` | Any | Pipeline exceeded time budget |

## Error Format

```json
{
  "error": "E007",
  "type": "InvalidOverride",
  "message": "Field 'stats.hp' is final and cannot be overridden",
  "stage": 5,
  "source": "entity/player",
  "field": "stats.hp",
  "recovery": "skip"
}
```

| Field | Description |
|-------|-------------|
| `error` | Error code string |
| `type` | Error type name |
| `message` | Human-readable description |
| `stage` | Pipeline stage number |
| `source` | Template or entity that caused the error |
| `field` | Specific field path (if applicable) |
| `recovery` | Recovery strategy |

## Recovery Strategies

| Strategy | Description |
|----------|-------------|
| `skip` | Skip the offending field/entity and continue |
| `default` | Substitute a default value |
| `retry` | Retry the stage (for transient errors) |
| `abort` | Halt the pipeline immediately |
| `manual` | Require human intervention |
