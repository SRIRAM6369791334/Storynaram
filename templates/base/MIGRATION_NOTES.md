# Migration Notes

## From v0 / Legacy (Pre-Framework)

If migrating from a pre-framework structure:

### Step 1: Identify Entity Types
Catalog all entity types. Assign each a prefix from `config/id_rules.json`.

### Step 2: Map Legacy IDs
For each existing entity, create a `BaseIdentifier.legacyIds` entry:

```json
{
  "legacyIds": [
    { "system": "legacy-v0", "value": "old-id-123", "migratedAt": "2026-07-17T00:00:00Z" }
  ]
}
```

### Step 3: Assign Required Blocks
Every entity needs at minimum: `identifier`, `metadata`, `audit`. Add other blocks as needed.

### Step 4: Validate
Run the validation engine against all migrated documents. Fix any rule violations.

### Step 5: Index
Generate database indexes from `BaseIndex` definitions.

## Base Template Versioning

When base templates change:

| Change Type | Version Impact | Migration Needed |
|-------------|----------------|-----------------|
| New optional field | Minor | No |
| New required field | Major | Yes |
| Field removed | Major | Yes |
| Field type changed | Major | Yes |
| Validation rule added | Minor | No |
| Validation rule tightened | Minor | Possible |
| Inheritance changes | Major | Yes |

### Migration Process for Template Updates

1. Update the `.template.json` file
2. Bump `templateVersion` in the version block
3. Bump `schemaVersion` in the version block if schema structure changed
4. Create a migration script in `scripts/migrations/`
5. Run against existing documents
6. Validate all documents post-migration

## Schema Compatibility

- Documents written against schema v1.x are forward-compatible with v2.x **only if** they do not use deprecated fields
- Documents may lag behind the current schema version up to 2 major versions
- The migration engine will auto-upgrade documents on write

## Rollback Plan

If a migration causes issues:

1. Revert the template file change
2. Run the rollback migration script
3. Restore documents from the event history (`BaseHistory.events`)
4. Pin `templateVersion` and `schemaVersion` to pre-migration values

## Scale Considerations

- **100,000+ entities**: Batch migration in chunks of 1,000. Use cursor-based pagination.
- **1,000,000+ documents**: Prefer async migration with progress tracking. Index rebuilds may take hours.
- **Multi-region**: Migrate one region at a time. Verify data consistency before proceeding.
