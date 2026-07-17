# Domain Validation Guide

## Validation Layers

Every domain document is validated through two layers:

### Layer 1: Core Schema Validation

Validates all BaseEntity fields:
- identifier format, required fields
- metadata completeness
- audit timestamps
- version semver patterns
- status enums
- relationship cardinality
- AI configuration

### Layer 2: Domain Schema Validation

Validates entity-specific fields:
- Entity required fields
- Entity enum values
- Entity field patterns
- Entity numeric ranges
- Entity array constraints

## Validation Flow

```bash
# Full validation against domain schema
validate --schema schemas/domain/Character.schema.json --document char_000001.json

# Core-only validation
validate --schema schemas/core/BaseEntity.schema.json --document char_000001.json

# Entity-only validation (skip core)
validate --entity --schema schemas/domain/Character.schema.json --document char_000001.json
```

## Common Validation Failures

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| Missing required identifier.id | Entity lacks valid ID | Generate ID in format `{prefix}_{sequence}` |
| entity.narrativeRole not in enum | Invalid role value | Use valid enum value |
| entity.abilities not array | Wrong type | Convert to string array |
| entity.personality missing | Required field absent | Add personality block |
| entity.appearance.age below 0 | Negative age | Set age >= 0 |
