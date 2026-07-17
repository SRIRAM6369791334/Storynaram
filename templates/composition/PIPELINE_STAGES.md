# Pipeline Stages

## Stage 1: Template Exists

| Property | Value |
|----------|-------|
| Input | Template `$id` or path |
| Output | Parsed template model or `MissingTemplate` |
| Error | Template file not found, unreadable, or unparseable |
| Config | `strict: true` (default) rejects missing optional templates |

## Stage 2: Inheritance Valid

| Property | Value |
|----------|-------|
| Input | Template + inheritance chain |
| Output | Resolved parent chain or `InvalidInheritance` |
| Error | Parent missing, circular chain, depth exceeded |
| Config | `maxDepth: 6` (default) |

## Stage 3: Dependencies Valid

| Property | Value |
|----------|-------|
| Input | Dependency list + registry |
| Output | Topologically sorted dependency list |
| Error | `MissingDependency`, `CircularDependency`, `InvalidVersion` |
| Config | `failOnMissingOptional: false` (default) |

## Stage 4: Merge Valid

| Property | Value |
|----------|-------|
| Input | Base + inherited + domain + extension templates |
| Output | Deep-merged template object |
| Error | `MergeConflict` for incompatible types |
| Config | `mergeArrays: concat_dedup` (default) |

## Stage 5: Override Rules Valid

| Property | Value |
|----------|-------|
| Input | Merged template + field modifiers |
| Output | Validated field overrides |
| Error | `InvalidOverride` for final/protected violations |

## Stage 6: Required Fields

| Property | Value |
|----------|-------|
| Input | Merged template + required list |
| Output | Complete field set |
| Error | `MissingRequiredField` with missing field names |

## Stage 7: Field Validation

| Property | Value |
|----------|-------|
| Input | Field values + schema types |
| Output | Type-checked and range-checked fields |
| Error | `ValidationFailure` with field path and reason |

## Stage 8: Reference Validation

| Property | Value |
|----------|-------|
| Input | Cross-references + registry |
| Output | All references resolved or flagged |
| Error | `RelationshipConflict` for unresolved refs |

## Stage 9: Business Rules

| Property | Value |
|----------|-------|
| Input | Composed template + domain logic |
| Output | Business-rule-compliant template |
| Error | `BusinessRuleViolation` with rule ID |

## Stage 10: AI Validation

| Property | Value |
|----------|-------|
| Input | Full composition + AI context |
| Output | Semantic consistency report |
| Error | `AISemanticIssue` with explanation |
| Config | `model: gpt-4`, `threshold: 0.85` |
