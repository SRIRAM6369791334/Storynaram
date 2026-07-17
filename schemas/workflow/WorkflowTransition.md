# WorkflowTransition

**File:** `WorkflowTransition.schema.json`

**Purpose:** Defines allowed state-to-state transitions with guards, conditions, triggers, auto-transition delays, and maintains transition history.

**Type:** Standalone Workflow Schema

**Template Source:** `templates/workflow/WorkflowTransition.template.json`

**Required Properties:** transition items require `from` and `to`

**Key Enums:** type (`manual`, `automatic`, `ai-driven`, `time-based`, `event-based`, `rule-based`)

**Referenced by:** Workflow.schema.json

**Validation Notes:** `unevaluatedProperties` is false; `transitionHistory` records actor, timestamp, and reason for each completed transition.
