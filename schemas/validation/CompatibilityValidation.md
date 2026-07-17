# CompatibilityValidation

**File:** `CompatibilityValidation.schema.json`

**Purpose:** Checks compatibility between schema versions, extensions, plugins, and integrations.

**Type:** Standalone Validation Schema

**Template Source:** `templates/validation/CompatibilityValidation.template.json`

**Required Properties:** `componentA`, `componentB`, `compatibilityRules`

**Key Enums:** `compatibility` (compatible, breaking, deprecated, unknown)

**Validation Scope:** cross-entity

**Cross-References:** VersionValidation, MigrationValidation, ExtensionValidation
