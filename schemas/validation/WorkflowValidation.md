# WorkflowValidation

**File:** `WorkflowValidation.schema.json`

**Purpose:** Validates workflow state transitions, step ordering, and condition completeness.

**Type:** Standalone Validation Schema

**Template Source:** `templates/validation/WorkflowValidation.template.json`

**Required Properties:** `workflowName`, `steps`, `transitions`

**Key Enums:** `transitionType` (auto, manual, conditional)

**Validation Scope:** workflow

**Cross-References:** ValidationProfile, BusinessRule
