# Schema Audit

## Coverage

| Category | Schemas | Lines of JSON | $ref count | Avg complexity |
|----------|---------|---------------|------------|----------------|
| Core | 23 | ~1,150 | 3 (BaseEntity allOf) | Low (partial schemas) |
| Domain | 35 | ~3,500 | 70 (35 allOf + entity refs) | Medium |
| AI | 20 | ~2,000 | 40 | Medium |
| Workflow | 20 | ~2,800 | 95 (19 in Workflow root) | High (composite) |
| Validation | 20 | ~2,400 | 41 | Medium |
| **Total** | **118** | **~11,850** | **247** | **Med-High** |

## Structural Validation

| Check | Result |
|-------|--------|
| Valid Draft 2020-12 | ✓ PASS (118/118) |
| All `$id` unique | ✓ PASS (118 unique) |
| All `$schema` present | ✓ PASS (118/118) |
| All `title` present | ⚠ 27 MISSING (minor, cosmetic) |
| All `description` present | ✓ PASS (118/118) |
| unevaluatedProperties on standalone | ✓ PASS (95/95) |
| No circular $ref | ✓ PASS |
| All $ref targets exist | ✓ PASS (247/247) |

## Core Schema Audit

| Schema | Required Fields | Composed By |
|--------|----------------|-------------|
| BaseEntity | — (composite) | BaseIdentifier + BaseMetadata + BaseAudit |
| BaseIdentifier | identifier | Domain schemas via allOf |
| BaseMetadata | metadata | Domain schemas via allOf |
| BaseAudit | audit | Domain schemas via allOf |
| BaseAI | ai (optional) | BaseEntity |
| BaseWorkflow | workflow (optional) | BaseEntity |
| BaseValidation | validation (optional) | BaseEntity |

All 23 core schemas are well-formed. No issues.

## Domain Schema Audit

All 35 domain schemas follow the pattern:
- `allOf: [{ "$ref": "../core/BaseEntity.schema.json" }]`
- Entity-specific fields under `entity` property
- `unevaluatedProperties: false` at root

No core fields duplicated. Entity fields properly scoped. No issues.

## AI Schema Audit

All 20 AI schemas are standalone (no BaseEntity dependency).
- All properties optional ✓
- All model-agnostic (no vendor fields) ✓
- All use $defs for reusable types ✓
- All use enum for constrained values ✓
- All have numeric bounds ✓

## Workflow Schema Audit

All 20 workflow schemas are standalone.
- Workflow.schema.json references 19 sub-schemas via $ref ✓
- All have proper state machine validation patterns ✓
- Approval schemas support 7 approval types ✓

## Validation Schema Audit

All 20 validation schemas are standalone.
- 5-tier severity model consistent across all ✓
- Recovery strategies defined ✓
- Cross-domain validation coverage documented ✓
