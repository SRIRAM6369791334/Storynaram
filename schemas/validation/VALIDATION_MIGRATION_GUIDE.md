# Validation Schema Migration Guide

## Migrating from Template to Schema

### Step 1: Add $schema

```json
// Before
{ "ruleId": "vr_001", "name": "required-title", "scope": "field", "severity": "high" }

// After
{
  "$schema": "https://storynaram.dev/schemas/validation/ValidationRule.schema.json",
  "ruleId": "vr_001",
  "name": "required-title",
  "scope": "field",
  "severity": "high"
}
```

### Step 2: Validate

```bash
validate --schema schemas/validation/ValidationRule.schema.json --document rules/vr_001.json
```

### Step 3: Fix Failures

| Issue | Fix |
|-------|-----|
| Invalid severity enum | Use valid value: critical/high/medium/low/info |
| Missing scope | Add scope matching scope enum |
| Invalid recovery | Use valid recovery enum value |
| Category mismatch | Match to valid category enum |

### Step 4: Batch Validation

```bash
validate --schema schemas/validation/ValidationProfile.schema.json --recursive --directory profiles/
```

## Version Migration

```bash
migrate --schema ValidationRule --from v1 --to v2 --dry-run
migrate --schema ValidationRule --from v1 --to v2
```

## Breaking vs Non-Breaking

| Change | Type | Action |
|--------|------|--------|
| New optional property | Non-breaking | No action |
| New enum value | Non-breaking | No action |
| Removed property | BREAKING | Remove from docs |
| Narrowed enum | BREAKING | Update values |
| New required field | BREAKING | Add values |
