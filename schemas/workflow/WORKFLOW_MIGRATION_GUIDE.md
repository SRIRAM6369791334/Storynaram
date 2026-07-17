# Workflow Schema Migration Guide

## Migrating from Template to Schema

### Step 1: Add $schema

```json
// Before
{ "workflowId": "wf_000001", "states": { ... }, "transitions": { ... } }

// After
{
  "$schema": "https://storynaram.dev/schemas/workflow/Workflow.schema.json",
  "workflowId": "wf_000001",
  "states": { ... },
  "transitions": { ... }
}
```

### Step 2: Validate

```bash
validate --schema schemas/workflow/Workflow.schema.json --document workflows/wf_000001.json
```

### Step 3: Fix Failures

| Issue | Fix |
|-------|-----|
| Missing $schema | Add $schema URL |
| Invalid enum value | Replace with valid enum |
| Cross-ref mismatch | Fix state/approver references |
| Missing required sub-field | Add or remove required |

### Step 4: Batch Validation

```bash
validate --schema schemas/workflow/Workflow.schema.json --recursive --directory workflows/
```

## Version Migration

```bash
migrate --schema Workflow --from v1 --to v2 --dry-run
migrate --schema Workflow --from v1 --to v2
```

## Breaking Changes

| Change | Impact | Mitigation |
|--------|--------|------------|
| New required field | BREAKING | Add field or update schema |
| Removed property | BREAKING | Remove from documents |
| Narrowed enum | BREAKING | Update values |
| New enum value | Non-breaking | Documents valid |
| New optional property | Non-breaking | No action needed |
