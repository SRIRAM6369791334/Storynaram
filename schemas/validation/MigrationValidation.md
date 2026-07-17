# MigrationValidation

**File:** `MigrationValidation.schema.json`

**Purpose:** Validates data migration scripts, schema change operations, and transformation rules.

**Type:** Standalone Validation Schema

**Template Source:** `templates/validation/MigrationValidation.template.json`

**Required Properties:** `migrationId`, `fromVersion`, `toVersion`, `operations`

**Key Enums:** `operationType` (add, remove, modify, rename, transform)

**Validation Scope:** workflow

**Cross-References:** VersionValidation, CompatibilityValidation
