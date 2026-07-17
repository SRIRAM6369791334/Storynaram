# WorkflowState

**File:** `WorkflowState.template.json`

**Purpose:** Defines valid workflow states — draft, planning, writing, review, approved, published, archived, deprecated, deleted, and custom states with metadata.

**Inputs:** `states[]` — each with `name`, `label`, `description`, `type` (initial/intermediate/final/error/terminal), `metadata.isEditable`, `isPublishable`, `isDeletable`, `requiresReview`, `requiresApproval`, `entryActions`, `exitActions`, `timeout`.

**Outputs:** `initialState`, `terminalStates[]`, `errorStates[]`.

**Dependencies:** Workflow (parent), WorkflowTransition (for valid state transitions).

**Relationships:** WorkflowTransition (from/to states), WorkflowAction (entry/exit actions), WorkflowApproval, WorkflowReview.

**Lifecycle:** `initial` → `intermediate` states → `final` or `terminal`. Error states catch failures.

**Future Extensions:** Add state-level permissions and role-based visibility rules.
