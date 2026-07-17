# Validation Framework — Migration Guide

## Migrating from Ad-hoc Validation

If validation logic currently lives in scripts or inline code:

| Legacy Pattern | Validation Replacement |
|----------------|----------------------|
| Inline field checks | ValidationRule with field scope |
| Script-based validation | ValidationProfile aggregating rules |
| Manual reference checks | ReferenceIntegrity automated checks |
| Ad-hoc workflow guards | WorkflowValidation |
| Manual AI output review | AIValidationProfile |

## Migration Steps

### Step 1: Catalog Existing Validation

Inventory all validation logic currently in use. Classify by scope (field, entity, cross-entity, workflow, AI).

### Step 2: Create Rules

Convert each validation check to a ValidationRule with severity, category, and recovery strategy.

### Step 3: Create Profiles

Group rules into ValidationProfiles per entity type.

### Step 4: Configure Integrity Checks

Enable ReferenceIntegrity, RelationshipIntegrity, and CanonIntegrity.

### Step 5: Replace Old Validation

Replace ad-hoc validation calls with the Validation Profile API.

## Version Migration

| Change | Impact |
|--------|--------|
| New rule added | Low |
| Rule severity changed | Medium — may affect pipeline pass/fail |
| Rule removed | High — coverage gap |
| Profile reorganized | Low |
| Integrity check enabled | Medium — may surface existing issues |
