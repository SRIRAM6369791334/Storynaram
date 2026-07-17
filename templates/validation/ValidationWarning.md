# ValidationWarning

**File:** `ValidationWarning.template.json`

**Purpose:** Represents a non-blocking alert from validation with suggestion for remediation.

**Inputs:** `warningId`, `ruleId`, `severity`, `category`, `field`, `value`, `expected`, `message`, `code`, `suggestion`, `timestamp`

**Outputs:** A warning object embedded in `ValidationResult.warnings` array.

**Dependencies:** `ValidationRule` (originating rule), `ValidationResult` (containing collection).

**Validation Rules:** Severity must be `low` or `info`; suggestion field provides actionable guidance; field must be valid JSON path.

**Future Extensions:** Auto-dismissal rules after warnings are reviewed or addressed.
