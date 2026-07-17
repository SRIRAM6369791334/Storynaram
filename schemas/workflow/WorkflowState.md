# WorkflowState

**File:** `WorkflowState.schema.json`

**Purpose:** Defines named states (initial, intermediate, final, error, terminal) for a workflow with metadata, entry/exit actions, and timeouts.

**Type:** Standalone Workflow Schema

**Template Source:** `templates/workflow/WorkflowState.template.json`

**Required Properties:** state items require `name`

**Key Enums:** type (`initial`, `intermediate`, `final`, `error`, `terminal`)

**Referenced by:** Workflow.schema.json

**Validation Notes:** `unevaluatedProperties` is false; `initialState` and `terminalStates` reference state names; metadata controls editability, publishability, deletability, review, and approval requirements.
