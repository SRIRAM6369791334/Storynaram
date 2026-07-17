# Migration Guide

## When Migration Is Needed

Migration is required when:
- **MAJOR version change**: Breaking changes to schema structure, required properties removed, type changes
- **Breaking property changes**: Properties renamed, removed, or changed in incompatible ways
- **Base schema changes**: Modifications to core schemas (BaseEntity, BaseAI, BaseWorkflow, BaseValidation) that affect dependent schemas

## Migration Process

1. **Assess**
   - Review the changelog for breaking changes
   - Identify affected schemas and consumers
   - Determine migration complexity

2. **Plan**
   - Document migration steps
   - Estimate effort and timeline
   - Assign migration owner

3. **Dry-Run**
   - Execute migration against a non-production environment
   - Validate results
   - Adjust plan as needed

4. **Execute**
   - Run migration in production
   - Monitor for errors
   - Follow runbook steps

5. **Validate**
   - Verify post-migration state
   - Run validation suite
   - Confirm all \$refs resolve

6. **Rollback (if needed)**
   - Revert to previous schema version
   - Restore data from backup
   - Document the failure cause

## Types of Migration

### Data Migration
- Transforming existing data to match new schema
- Default value injection for new properties
- Data type coercion or conversion

### Schema Migration
- Updating schema files to new version
- Applying new constraints and validation rules
- Updating registry entries

### Code Migration
- Updating consumer code to use new schema version
- Adapting to renamed or restructured properties
- Updating serialization/deserialization logic

## Rollback Procedures

1. Identify the last known-good version
2. Restore schema files from version control
3. Restore data from backup (if data migration was performed)
4. Revert registry files
5. Validate post-rollback state
6. Notify consumers of rollback
