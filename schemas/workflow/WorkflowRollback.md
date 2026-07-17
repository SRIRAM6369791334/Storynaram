# WorkflowRollback

**File:** `WorkflowRollback.schema.json`

**Purpose:** Provides rollback capabilities via sequential undo, snapshot restore, or compensating actions, with data restoration and notification controls.

**Type:** Standalone Workflow Schema

**Template Source:** `templates/workflow/WorkflowRollback.template.json`

**Required Properties:** none

**Key Enums:** strategy (`sequential`, `snapshot`, `compensating`)

**Referenced by:** Workflow.schema.json

**Validation Notes:** `unevaluatedProperties` is false; rollback is disabled by default; data restore can exclude specific fields and reference a backup location.
