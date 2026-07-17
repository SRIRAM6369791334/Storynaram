# WorkflowApproval

**File:** `WorkflowApproval.schema.json`

**Purpose:** Defines approval workflows with multi-stage, parallel, sequential, AI, or hybrid approval chains and escalation rules.

**Type:** Standalone Workflow Schema

**Template Source:** `templates/workflow/WorkflowApproval.template.json`

**Required Properties:** none

**Key Enums:** type (`single`, `multi-stage`, `parallel`, `sequential`, `ai`, `human`, `hybrid`); approver type (`user`, `group`, `ai`, `role`); voting type (`unanimous`, `majority`, `super-majority`, `any`, `weighted`); result (`approved`, `rejected`, `pending`, `escalated`, `expired`)

**Referenced by:** Workflow.schema.json

**Validation Notes:** `unevaluatedProperties` is false; escalations can chain across stages with deadline-based expiry actions.
