# ExtensionValidation

**File:** `ExtensionValidation.schema.json`

**Purpose:** Validates extension configuration, dependency declarations, and hook registration.

**Type:** Standalone Validation Schema

**Template Source:** `templates/validation/ExtensionValidation.template.json`

**Required Properties:** `extensionId`, `hooks`, `dependencies`

**Key Enums:** `hookType` (before, after, replace, augment)

**Validation Scope:** entity / cross-entity

**Cross-References:** PluginValidation, CompatibilityValidation
