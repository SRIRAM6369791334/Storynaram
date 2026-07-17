# WorkflowCheckpoint

**File:** `WorkflowCheckpoint.schema.json`

**Purpose:** Manages workflow state snapshots at configurable intervals or on transition for rollback and recovery.

**Type:** Standalone Workflow Schema

**Template Source:** `templates/workflow/WorkflowCheckpoint.template.json`

**Required Properties:** none

**Key Enums:** storage (`memory`, `file`, `database`, `object-store`)

**Referenced by:** Workflow.schema.json

**Validation Notes:** `unevaluatedProperties` is false; `maxCheckpoints` caps history length; each checkpoint can optionally disable rollback via `canRollbackTo`.
