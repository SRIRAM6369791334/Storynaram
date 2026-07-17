# Domain Schema Checklist

## Schema Definition

- [ ] All 35 domain schemas created in Draft 2020-12 format
- [ ] Every schema uses `allOf: [{ "$ref": "../core/BaseEntity.schema.json" }]`
- [ ] No core field definitions duplicated in domain schemas
- [ ] Every schema has unique `$id`
- [ ] Every schema has `title` and `description`
- [ ] `unevaluatedProperties: false` set on every schema
- [ ] Entity-specific fields scoped under `entity` property
- [ ] Entity `required` fields correctly identified

## Field Constraints

- [ ] Enums defined for all constrained value sets
- [ ] Patterns defined for formatted string fields
- [ ] Min/max set for all numeric fields
- [ ] Array items properly typed
- [ ] Nested objects have property definitions

## Cross-Entity References

- [ ] Reference fields typed as string
- [ ] Reference field names match target entity types
- [ ] Reference arrays have item types defined

## Validation

- [ ] All schemas valid against Draft 2020-12 meta-schema
- [ ] All $ref paths resolve to existing files
- [ ] No circular $ref chains
- [ ] Sample documents validate against domain schemas
- [ ] Sample documents validate against BaseEntity schema

## Documentation

- [ ] README.md with catalog and hierarchy diagram
- [ ] DOMAIN_SCHEMA_GUIDE.md with pattern documentation
- [ ] DOMAIN_REFERENCE_MODEL.md with reference map
- [ ] DOMAIN_VALIDATION_GUIDE.md with validation flow
- [ ] DOMAIN_MIGRATION_GUIDE.md with migration steps
- [ ] DOMAIN_CHECKLIST.md with this checklist
- [ ] DOMAIN_DIAGRAMS.md with Mermaid diagrams
- [ ] Individual README for each schema (35 files)

## Production Readiness

- [ ] $schema added to all domain entity documents
- [ ] Existing documents validated against domain schemas
- [ ] CI/CD pipeline includes domain schema validation
- [ ] Migration path documented for MAJOR schema changes
