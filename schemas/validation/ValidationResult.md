# ValidationResult

**File:** `ValidationResult.schema.json`

**Purpose:** Captures the outcome of a validation run including pass/fail status and details.

**Type:** Standalone Validation Schema

**Template Source:** `templates/validation/ValidationResult.template.json`

**Required Properties:** `validationId`, `status`, `timestamp`

**Key Enums:** `status` (passed, failed, skipped, error)

**Validation Scope:** field / entity

**Cross-References:** ValidationError, ValidationWarning, ValidationProfile
