# Version Upgrade Guide

## Step-by-Step Upgrade Process

### 1. Check Current Version
- Open `schemas/registry/schema-registry.json`
- Note the current version for each category
- Check `schemas/registry/core-registry.json` for detailed core schema versions

### 2. Check Target Compatibility
- Review `schemas/compatibility/COMPATIBILITY_MATRIX.md`
- Verify that the target version is compatible with all dependencies
- Check for any known issues with the target version
- Review the changelog for breaking changes between current and target

### 3. Run Migration Dry-Run
```
# Execute against staging environment
# Validate all schemas load correctly
# Check all \$refs resolve
# Verify no circular dependencies introduced
```

### 4. Execute Migration
- Deploy new schema files
- Update registry files to new version numbers
- Run `schema-registry.json` update
- Run `core-registry.json` update if core schemas changed

### 5. Validate Post-Migration
- Run full validation suite
- Verify all 118 schemas load without errors
- Confirm all cross-schema references resolve
- Run integration tests
- Verify consumer compatibility

### 6. Update Version Registry
- Update version numbers in all registry files
- Update compatibility matrix
- Update release manifest
- Update changelog

### 7. Document Issues
- Log any issues encountered during upgrade
- Update known issues registry
- Report migration blockers
- Create follow-up tasks for unresolved issues
