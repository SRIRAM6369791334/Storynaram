# PluginValidation

**File:** `PluginValidation.schema.json`

**Purpose:** Validates plugin metadata, lifecycle hooks, and inter-plugin dependency resolution.

**Type:** Standalone Validation Schema

**Template Source:** `templates/validation/PluginValidation.template.json`

**Required Properties:** `pluginId`, `version`, `lifecycle`

**Key Enums:** `lifecycleEvent` (install, activate, deactivate, uninstall)

**Validation Scope:** entity

**Cross-References:** ExtensionValidation, IntegrationProfile, CompatibilityValidation
