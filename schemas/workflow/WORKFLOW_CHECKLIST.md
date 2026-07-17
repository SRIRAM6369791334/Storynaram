# Workflow Schema Checklist

## Schema Definition

- [ ] All 20 workflow schemas created in Draft 2020-12 format
- [ ] Every schema has unique `$id`, `title`, `description`
- [ ] `unevaluatedProperties: false` on every schema
- [ ] Composite Workflow.schema.json references all sub-schemas via `$ref`
- [ ] No base entity core schemas duplicated

## $defs Design

- [ ] All reusable sub-objects extracted to `$defs`
- [ ] `$defs` referenced via `$ref` where used
- [ ] No inline duplication of object definitions
- [ ] `$defs` names are PascalCase

## Constraints

- [ ] All numeric fields have `minimum`/`maximum` where applicable
- [ ] All date-time fields use `"format": "date-time"`
- [ ] All semver fields use pattern `^\d+\.\d+\.\d+$`
- [ ] Default values specified for common cases (booleans, counts)
- [ ] Enum values are exhaustive and documented

## State Machine Integrity

- [ ] Exactly one initial state defined
- [ ] All states reachable from initial state
- [ ] Terminal states have no outgoing transitions
- [ ] Error states accessible from all non-terminal states
- [ ] Transition `from`/`to` match state names

## Cross-Schema Integrity

- [ ] No circular `$ref` chains
- [ ] All `$ref` paths resolve to existing files
- [ ] Approval stage approvers reference defined approvers
- [ ] Checkpoint IDs referenced by rollback exist

## Documentation

- [ ] README.md with catalog and hierarchy
- [ ] WORKFLOW_SCHEMA_GUIDE.md
- [ ] WORKFLOW_REFERENCE_MODEL.md
- [ ] WORKFLOW_VALIDATION_GUIDE.md
- [ ] WORKFLOW_MIGRATION_GUIDE.md
- [ ] WORKFLOW_COMPATIBILITY_MATRIX.md
- [ ] WORKFLOW_CHECKLIST.md
- [ ] Individual README for each schema (20 files)

## Runtime Readiness

- [ ] $schema added to all workflow definition documents
- [ ] Existing workflow templates validated
- [ ] CI/CD includes workflow schema validation
- [ ] Cross-schema validation implemented in runtime
