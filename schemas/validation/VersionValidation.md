# VersionValidation

**File:** `VersionValidation.schema.json`

**Purpose:** Validates version strings, compatibility ranges, and version constraint expressions.

**Type:** Standalone Validation Schema

**Template Source:** `templates/validation/VersionValidation.template.json`

**Required Properties:** `version`, `constraints`

**Key Enums:** `constraintType` (exact, range, minimum, maximum, semver)

**Validation Scope:** field / entity

**Cross-References:** CompatibilityValidation, MigrationValidation
