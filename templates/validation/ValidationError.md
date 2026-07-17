# ValidationError

**File:** `ValidationError.template.json`

**Purpose:** Represents a detailed error record from a validation failure with severity, category, expected vs actual values, and recovery strategy.

**Inputs:** `errorId`, `ruleId`, `severity`, `category`, `field`, `value`, `expected`, `message`, `errorCode`, `recovery`, `timestamp`

**Outputs:** An error object embedded in `ValidationResult.errors` array and surfaced to callers.

**Dependencies:** `ValidationRule` (originating rule), `ValidationResult` (containing collection).

**Validation Rules:** Severity must be `critical`, `high`, `medium`, `low`, or `info`; recovery must be a valid enum value; field must be valid JSON path.

**Future Extensions:** Structured remediation steps with automated fix scripts per error code.
