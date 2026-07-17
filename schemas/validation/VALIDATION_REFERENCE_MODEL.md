# Validation Reference Model

## Validation Pipeline

```mermaid
flowchart LR
    subgraph "Definition"
        RULES[Validation Rules]
        CONSTRAINTS[Constraints]
        BUSINESS[Business Rules]
        PROFILES[Validation Profiles]
    end

    subgraph "Execution"
        ENGINE[Validation Engine]
        CONTEXT[Entity Context]
    end

    subgraph "Integrity"
        REF[Reference Check]
        REL[Relationship Check]
        CANON[Canon Check]
    end

    subgraph "Domain Checks"
        WF[Workflow Validation]
        AI[AI Validation]
        SEC[Security Check]
        PERM[Permission Check]
        VER[Version Check]
    end

    subgraph "Results"
        RESULT[Validation Result]
        ERRORS[Errors]
        WARNINGS[Warnings]
        SUMMARY[Summary]
    end

    PROFILES --> ENGINE
    RULES --> ENGINE
    CONSTRAINTS --> ENGINE
    BUSINESS --> ENGINE
    CONTEXT --> ENGINE

    ENGINE --> REF
    ENGINE --> REL
    ENGINE --> CANON
    ENGINE --> WF
    ENGINE --> AI
    ENGINE --> SEC
    ENGINE --> PERM
    ENGINE --> VER

    REF --> RESULT
    REL --> RESULT
    CANON --> RESULT
    WF --> RESULT
    AI --> RESULT
    SEC --> RESULT
    PERM --> RESULT
    VER --> RESULT

    RESULT --> ERRORS
    RESULT --> WARNINGS
    RESULT --> SUMMARY
```

## Cross-Schema Validation Coverage

| Schema | Core | Domain | AI | Workflow | Validation |
|--------|:----:|:------:|:--:|:--------:|:----------:|
| ValidationRule | ✓ | ✓ | ✓ | ✓ | - |
| ValidationProfile | ✓ | ✓ | ✓ | ✓ | - |
| ValidationResult | ✓ | ✓ | ✓ | ✓ | ✓ |
| ReferenceIntegrity | - | ✓ | ✓ | - | ✓ |
| RelationshipIntegrity | - | ✓ | - | - | ✓ |
| CanonIntegrity | - | ✓ | ✓ | - | ✓ |
| WorkflowValidation | - | - | - | ✓ | ✓ |
| AIValidationProfile | - | - | ✓ | - | ✓ |
| SecurityValidation | ✓ | - | - | - | ✓ |
| PermissionValidation | ✓ | ✓ | - | - | ✓ |
| VersionValidation | ✓ | ✓ | ✓ | ✓ | ✓ |
| ExtensionValidation | ✓ | ✓ | ✓ | ✓ | ✓ |
| PluginValidation | - | - | ✓ | ✓ | ✓ |
| IntegrationProfile | ✓ | ✓ | ✓ | ✓ | ✓ |
