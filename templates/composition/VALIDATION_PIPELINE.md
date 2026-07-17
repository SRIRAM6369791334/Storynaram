# Validation Pipeline

## 10-Stage Validation Sequence

| Stage | Name | Description |
|-------|------|-------------|
| 1 | Template Exists | Verify template file is accessible and parseable |
| 2 | Inheritance Valid | Parent template exists and chain is acyclic |
| 3 | Dependencies Valid | All required deps resolved, versions satisfied |
| 4 | Merge Valid | Merge operations completed without type errors |
| 5 | Override Rules Valid | No `final` fields overridden, modifiers respected |
| 6 | Required Fields | All `required` fields present after merge |
| 7 | Field Validation | Type checks, range checks, pattern validation |
| 8 | Reference Validation | Cross-template and cross-entity references resolve |
| 9 | Business Rules | Domain-specific logic rules (e.g., HP > 0) |
| 10 | AI Validation | LLM-based semantic consistency check |

## Mermaid Validation Flow

```mermaid
flowchart TD
    Start([Template Input]) --> S1[Stage 1: Template Exists]
    S1 -->|Pass| S2[Stage 2: Inheritance Valid]
    S1 -->|Fail| E1[Error: MissingTemplate]
    S2 -->|Pass| S3[Stage 3: Dependencies Valid]
    S2 -->|Fail| E2[Error: InvalidInheritance]
    S3 -->|Pass| S4[Stage 4: Merge Valid]
    S3 -->|Fail| E3[Error: MissingDependency]
    S4 -->|Pass| S5[Stage 5: Override Rules Valid]
    S4 -->|Fail| E4[Error: MergeConflict]
    S5 -->|Pass| S6[Stage 6: Required Fields]
    S5 -->|Fail| E5[Error: InvalidOverride]
    S6 -->|Pass| S7[Stage 7: Field Validation]
    S6 -->|Fail| E6[Error: MissingRequiredField]
    S7 -->|Pass| S8[Stage 8: Reference Validation]
    S7 -->|Fail| E7[Error: ValidationFailure]
    S8 -->|Pass| S9[Stage 9: Business Rules]
    S8 -->|Fail| E8[Error: RelationshipConflict]
    S9 -->|Pass| S10[Stage 10: AI Validation]
    S9 -->|Fail| E9[Error: BusinessRuleViolation]
    S10 -->|Pass| Done([Composition Complete])
    S10 -->|Fail| E10[Error: AISemanticIssue]
```

## Stage Configuration

Each stage can be individually enabled/disabled and configured with severity (`error`, `warning`, `info`).
