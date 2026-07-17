# WorkflowCondition

**File:** `WorkflowCondition.schema.json`

**Purpose:** Defines conditional logic for workflow transitions and triggers, supporting field, status, time, permission, and AI-based evaluations.

**Type:** Standalone Workflow Schema

**Template Source:** `templates/workflow/WorkflowCondition.template.json`

**Required Properties:** none

**Key Enums:** type (`field`, `status`, `relationship`, `time`, `permission`, `ai`, `custom`); operator (`equals`, `not-equals`, `greater-than`, `less-than`, `in`, `not-in`, `exists`, `not-exists`, `matches`, `custom`); severity (`error`, `warning`, `info`); evaluationMode (`all`, `any`, `sequence`)

**Referenced by:** Workflow.schema.json

**Validation Notes:** `unevaluatedProperties` is false; evaluation mode defaults to `all` — all conditions must pass unless `any` or `sequence` is specified.
