# Schema Migration Guide

## Migrating from Template-Based to Schema-Based

### Step 1: Replace Inline Validation with Schema Validation

Before (template-based):
```json
// Inline checks in code
if (!/^[a-z]+_[0-9]{6,}$/.test(entity.id)) throw Error()
```

After (schema-based):
```json
{
  "$schema": "https://storynaram.dev/schemas/core/BaseEntity.schema.json",
  "identifier": { "id": "char_000001", ... }
}
```

### Step 2: Add $schema to All Entity Documents

Every entity document must declare its schema:
```json
{ "$schema": "https://storynaram.dev/schemas/core/BaseEntity.schema.json" }
```

### Step 3: Validate Existing Documents

```bash
validate --schema schemas/core/BaseEntity.schema.json --document characters/char_000001.json
validate --schema schemas/core/BaseEntity.schema.json --recursive --directory characters/
```

### Step 4: Fix Validation Failures

Common migration issues:
| Issue | Fix |
|-------|-----|
| Wrong ID format | Regenerate with correct pattern |
| Missing required fields | Add missing fields |
| Wrong field types | Convert types |
| Invalid enum values | Replace with valid values |

## Cross-Version Migration

When upgrading from v1 to v2 of a schema:

```bash
# Dry run
migrate --schema BaseIdentifier --from v1 --to v2 --dry-run

# Execute migration
migrate --schema BaseIdentifier --from v1 --to v2

# Validate after migration
validate --schema schemas/core/v2/BaseIdentifier.schema.json --recursive
```

## Rollback

If a migration causes issues:

1. Restore documents from backup
2. Pin schema version to pre-migration version
3. Revert schema file
4. Run validation to confirm
