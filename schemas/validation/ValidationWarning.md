# ValidationWarning

**File:** `ValidationWarning.schema.json`

**Purpose:** Indicates a non-blocking validation concern that may require attention.

**Type:** Standalone Validation Schema

**Template Source:** `templates/validation/ValidationWarning.template.json`

**Required Properties:** `code`, `message`, `path`

**Key Enums:** `code` (DEPRECATED_USAGE, PERFORMANCE_ISSUE, BEST_PRACTICE)

**Validation Scope:** field / entity

**Cross-References:** ValidationResult, ValidationError
