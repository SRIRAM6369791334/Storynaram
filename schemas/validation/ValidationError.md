# ValidationError

**File:** `ValidationError.schema.json`

**Purpose:** Represents a single validation failure with error code, message, and source location.

**Type:** Standalone Validation Schema

**Template Source:** `templates/validation/ValidationError.template.json`

**Required Properties:** `code`, `message`, `path`

**Key Enums:** `code` (e.g., MISSING_FIELD, TYPE_MISMATCH, CONSTRAINT_VIOLATION)

**Validation Scope:** field

**Cross-References:** ValidationResult, ValidationConstraint
