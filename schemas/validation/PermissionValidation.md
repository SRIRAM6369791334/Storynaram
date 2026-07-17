# PermissionValidation

**File:** `PermissionValidation.schema.json`

**Purpose:** Validates that permission assignments, roles, and access control entries are correctly structured.

**Type:** Standalone Validation Schema

**Template Source:** `templates/validation/PermissionValidation.template.json`

**Required Properties:** `role`, `permissions`, `scope`

**Key Enums:** `role` (admin, editor, viewer, custom), `scope` (global, entity, field)

**Validation Scope:** security

**Cross-References:** SecurityValidation, ExtensionValidation
