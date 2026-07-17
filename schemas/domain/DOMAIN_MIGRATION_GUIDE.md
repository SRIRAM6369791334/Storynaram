# Domain Schema Migration Guide

## Migrating from Template to Schema

### Step 1: Add $schema to Documents

```json
// Before
{ "identifier": { ... }, "metadata": { ... }, "entity": { ... } }

// After
{
  "$schema": "https://storynaram.dev/schemas/domain/Character.schema.json",
  "identifier": { ... },
  "metadata": { ... },
  "entity": { ... }
}
```

### Step 2: Validate Existing Documents

```bash
validate --schema schemas/domain/Character.schema.json --document characters/char_000001.json
```

### Step 3: Fix Validation Failures

Common issues and fixes:

| Issue | Fix |
|-------|-----|
| Missing $schema field | Add $schema URL |
| Entity fields at root level | Move to entity block |
| Wrong field type | Convert type |
| Invalid enum value | Replace with valid enum |
| Missing required field | Add field with value |
| Extra core fields | Remove — inherited via allOf |

### Step 4: Batch Migration

```bash
# Dry run on all characters
migrate --schema Character --dry-run

# Execute migration
migrate --schema Character

# Validate all after migration
validate --schema schemas/domain/Character.schema.json --recursive --directory characters/
```

## Cross-Version Migration

When upgrading a domain schema:

```bash
# Dry run
migrate --schema Character --from v1 --to v2 --dry-run

# Execute
migrate --schema Character --from v1 --to v2
```

## Rollback

1. Restore documents from backup
2. Revert schema file
3. Pin $schema to previous version
4. Run validation
