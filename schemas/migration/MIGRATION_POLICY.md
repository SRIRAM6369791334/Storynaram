# Migration Policy

## Requirements

| # | Requirement |
|---|-------------|
| 1 | Every MAJOR version change requires a documented migration path |
| 2 | Migration paths must include: `fromVersion`, `toVersion`, `fieldMappings`, `transforms`, `dataLossCheck`, `rollbackPlan` |
| 3 | N-2 backward compatibility: current version supports migration from up to 2 MAJOR versions back |
| 4 | Migration must be reversible within 30 days |
| 5 | Automated migration preferred over manual |
| 6 | Migration dry-run required before production execution |
| 7 | Migration validation must pass before cutover |

## Migration Path Structure

```yaml
fromVersion: "1.x"
toVersion: "2.x"
fieldMappings:
  oldField: newField
  oldNamespace.property: newNamespace.property
transforms:
  - type: rename
    from: foo
    to: bar
  - type: default
    field: newField
    value: defaultValue
  - type: remove
    field: deprecatedField
dataLossCheck:
  - field: deprecatedField
    risk: true
    action: warn
rollbackPlan:
  steps:
    - Revert schema to fromVersion
    - Reverse-transform data
    - Verify integrity
```

## Process

1. **Author migration path** — Document the complete migration including mappings and transforms.
2. **Dry-run** — Execute migration in a staging environment against a copy of production data.
3. **Validate** — Run schema validation and integrity checks on migrated data.
4. **Notify** — Inform all consumers of the migration window.
5. **Execute** — Perform the migration in production.
6. **Verify** — Confirm data integrity post-migration.
7. **Rollback (if needed)** — Reverse the migration within the 30-day reversibility window.
