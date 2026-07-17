# ValidationProfile

**File:** `ValidationProfile.template.json`

**Purpose:** Groups validation rules for one or more entity types with configurable mode, overrides, and execution priority.

**Inputs:** `profileId`, `name`, `entityTypes`, `rules`, `mode`, `overrides`, `enabled`, `priority`

**Outputs:** A compiled validation profile ready for execution against target entities.

**Dependencies:** `ValidationRule` templates referenced in the `rules` array; `ValidationResult` captures execution output.

**Validation Rules:** Validates that all referenced rules exist; enforces mode enum (`strict`, `lenient`, `custom`); checks override structure against target rule schemas.

**Future Extensions:** Dynamic profile composition from multiple base profiles with inheritance.
