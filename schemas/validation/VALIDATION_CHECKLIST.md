# Validation Schema Checklist

## Schema Definition

- [ ] All 20 validation schemas created in Draft 2020-12 format
- [ ] Every schema has unique `$id`, `title`, `description`
- [ ] `unevaluatedProperties: false` on every schema
- [ ] No base entity core schemas duplicated

## $defs Design

- [ ] Reusable sub-objects extracted to `$defs`
- [ ] `$defs` referenced via `$ref`
- [ ] No inline duplication
- [ ] PascalCase naming

## Constraints

- [ ] All enums are exhaustive (scope, severity, category, recovery, type)
- [ ] All numeric fields bounded with min/max
- [ ] All date-time fields use `"format": "date-time"`
- [ ] Default values specified for common cases
- [ ] Semver patterns use `^\d+\.\d+\.\d+$`

## Cross-Schema Integrity

- [ ] No circular `$ref` chains
- [ ] All `$ref` paths resolve to existing files
- [ ] Rule severity consistent across schemas (same enum)
- [ ] Profile mode consistent with business meaning
- [ ] Integration layers reference valid layer names

## Documentation

- [ ] README.md with catalog and hierarchy
- [ ] VALIDATION_SCHEMA_GUIDE.md
- [ ] VALIDATION_REFERENCE_MODEL.md
- [ ] VALIDATION_RULE_GUIDE.md
- [ ] VALIDATION_MIGRATION_GUIDE.md
- [ ] VALIDATION_COMPATIBILITY_MATRIX.md
- [ ] VALIDATION_CHECKLIST.md
- [ ] Individual README for each schema (20 files)

## Runtime Readiness

- [ ] $schema added to all validation rule documents
- [ ] Cross-schema validation rules documented
- [ ] Scoring model documented (0-100 scale)
- [ ] Severity escalation path defined
