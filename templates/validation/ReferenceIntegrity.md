# ReferenceIntegrity

**File:** `ReferenceIntegrity.template.json`

**Purpose:** Validates references between entities including orphan detection, dangling reference checks, and circular reference detection.

**Inputs:** `entityType`, `referenceFields`, `orphanCheck`, `danglingCheck`, `cycleDetection`

**Outputs:** Integrity validation results flagging broken, missing, or circular references.

**Dependencies:** Entity templates for target types; `ValidationProfile` orchestrates integrity checks; base `BaseReference` for reference structure.

**Validation Rules:** Validates target entities exist; detects orphaned records with no valid parent; identifies dangling foreign keys; detects cycles in parent-child references.

**Future Extensions:** Automatic repair of dangling references through configurable cascade strategies.
