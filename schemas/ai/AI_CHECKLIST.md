# AI Schema Checklist

## Schema Definition

- [ ] All 20 AI schemas created in Draft 2020-12 format
- [ ] Every schema has unique `$id`
- [ ] Every schema has `title` and `description`
- [ ] `unevaluatedProperties: false` set on every schema
- [ ] All properties use correct types
- [ ] All enums are exhaustive and documented

## Reusable Definitions

- [ ] Complex sub-objects extracted to `$defs`
- [ ] `$defs` referenced via `$ref` where used multiple times
- [ ] No inline duplication of object definitions
- [ ] `$defs` have meaningful names (PascalCase)

## Constraints

- [ ] All numeric fields have `minimum`/`maximum`
- [ ] All date-time fields use `"format": "date-time"`
- [ ] All semver fields use pattern `^\d+\.\d+\.\d+$`
- [ ] Default values specified for common cases
- [ ] Model-agnostic — no vendor-specific fields

## Cross-Schema Integrity

- [ ] No circular `$ref` chains
- [ ] All `$ref` paths resolve to existing files
- [ ] No schema references another that doesn't exist
- [ ] Model IDs in AISession match AIConfiguration.models
- [ ] Token allocation respects maxContextTokens

## Documentation

- [ ] README.md with catalog and hierarchy
- [ ] AI_SCHEMA_GUIDE.md with schema pattern
- [ ] AI_REFERENCE_MODEL.md with data flow diagrams
- [ ] AI_VALIDATION_GUIDE.md with validation flow
- [ ] AI_MIGRATION_GUIDE.md with migration steps
- [ ] AI_COMPATIBILITY_MATRIX.md with model support
- [ ] AI_CHECKLIST.md with this checklist
- [ ] Individual README for each schema (20 files)

## Runtime Readiness

- [ ] $schema added to all AI configuration documents
- [ ] Existing documents validated against AI schemas
- [ ] CI/CD pipeline includes AI schema validation
- [ ] Cross-schema validation implemented in runtime
- [ ] Migration path documented for MAJOR changes
