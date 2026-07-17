# AI Schema Migration Guide

## Migrating from Template to Schema

### Step 1: Add $schema to AI Documents

```json
// Before
{ "defaultModel": "gpt-4", "parameters": { "temperature": 0.7 } }

// After
{
  "$schema": "https://storynaram.dev/schemas/ai/AIConfiguration.schema.json",
  "defaultModel": "gpt-4",
  "parameters": { "temperature": 0.7 }
}
```

### Step 2: Validate Existing AI Documents

```bash
validate --schema schemas/ai/AIConfiguration.schema.json --document config/ai-config.json
```

### Step 3: Fix Validation Failures

| Issue | Fix |
|-------|-----|
| Missing $schema | Add $schema URL |
| Invalid enum value | Replace with valid enum |
| Numeric out of range | Clamp to valid range |
| Wrong field type | Convert to correct type |
| Unknown modelId | Add to models[] or correct ID |
| Token budget overflow | Adjust allocation |

### Step 4: Batch Migration

```bash
validate --schema schemas/ai/AIConfiguration.schema.json --recursive --directory config/ai/
```

## Cross-Version Migration

```bash
migrate --schema AIConfiguration --from v1 --to v2 --dry-run
migrate --schema AIConfiguration --from v1 --to v2
```

## Breaking vs Non-Breaking Changes

| Change Type | Examples | Version Impact |
|-------------|----------|----------------|
| Non-breaking | New optional property, new enum value | MINOR |
| Breaking | Removed property, new required field, renamed enum | MAJOR |
| Deprecation | Property marked deprecated | MINOR (+ notice) |

## Rollback

1. Keep previous schema version files
2. Pin $schema to previous version
3. Revert document changes
4. Run validation against previous schema
