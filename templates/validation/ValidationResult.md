# ValidationResult

**File:** `ValidationResult.template.json`

**Purpose:** Captures the outcome of a validation run with pass/fail status, aggregate score, counts, and detailed errors and warnings.

**Inputs:** `resultId`, `timestamp`, `profileId`, `entityId`, `entityType`, `passed`, `score`, `ruleCount`, `passedCount`, `failedCount`, `warningCount`, `errors`, `warnings`, `summary`

**Outputs:** A complete validation report consumed by UIs, APIs, and downstream automation.

**Dependencies:** `ValidationProfile` (source), `ValidationError` and `ValidationWarning` (nested references), `ValidationRule` (executed rules).

**Validation Rules:** Score must be 0–100; counts must be non-negative; `errors` and `warnings` arrays reference valid templates; duration in summary must be positive.

**Future Extensions:** Paginated result sets for large-scale validation runs with streaming output.
