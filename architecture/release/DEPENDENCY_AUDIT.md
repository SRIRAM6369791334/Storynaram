# Dependency Audit

## Dependency Graph Summary

```
Level 0 (Foundation): BaseIdentifier, BaseMetadata, BaseAudit
Level 1 (Core):       BaseEntity (composes Level 0)
Level 2 (Domain):     35 domain entities (allOf → BaseEntity)
Level 2 (AI):         20 AI schemas (standalone, optional BaseAI)
Level 2 (Workflow):   20 workflow schemas (standalone, optional BaseWorkflow)
Level 2 (Validation): 20 validation schemas (standalone, optional BaseValidation)
```

## Cross-Category Dependencies

| Source | Target | Count | Type |
|--------|--------|-------|------|
| Domain (35) | Core (BaseEntity) | 35 | allOf $ref |
| Core (BaseEntity) | Core (BaseIdentifier) | 1 | allOf $ref |
| Core (BaseEntity) | Core (BaseMetadata) | 1 | allOf $ref |
| Core (BaseEntity) | Core (BaseAudit) | 1 | allOf $ref |
| Workflow (Workflow) | Workflow (19 sub-schemas) | 19 | $ref |
| Core (BaseEntity) | Core (optional: 19 core schemas) | 19 | $ref |

## Circular Dependency Scan

| Check | Result |
|-------|--------|
| domain→core | No reverse dependency ← core does not reference domain |
| ai→core | No reverse dependency ← core does not reference AI |
| workflow→workflow | No circular ← Workflow references sub-schemas, sub-schemas do not reference Workflow |
| validation→validation | No circular |

**Circular dependencies detected: 0**

## Dependency Depth

| Path | Max Depth |
|------|-----------|
| BaseIdentifier → BaseEntity → Character | 3 |
| BaseMetadata → BaseEntity → Character | 3 |
| BaseAudit → BaseEntity → Character | 3 |
| Workflow → WorkflowState | 2 |
| (AI schemas standalone) | 1 |
| (Validation schemas standalone) | 1 |

## Most Depended-Upon Schemas

| Schema | Depended By | Count |
|--------|-------------|-------|
| BaseEntity | Domain schemas | 35 |
| BaseIdentifier | BaseEntity | 1 |
| BaseMetadata | BaseEntity | 1 |
| BaseAudit | BaseEntity | 1 |
| Workflow (root) | (activates sub-schemas) | 19 refs |
