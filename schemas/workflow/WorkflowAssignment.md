# WorkflowAssignment

**File:** `WorkflowAssignment.schema.json`

**Purpose:** Assigns workflow tasks to users, groups, roles, or AI agents with routing strategies, dependencies, and deadline tracking.

**Type:** Standalone Workflow Schema

**Template Source:** `templates/workflow/WorkflowAssignment.template.json`

**Required Properties:** none

**Key Enums:** assignee type (`user`, `group`, `role`, `ai`); assigner type (`user`, `system`, `ai`, `rule`); priority (`critical`, `high`, `medium`, `low`, `backlog`); status (`pending`, `assigned`, `in-progress`, `completed`, `blocked`, `deferred`, `cancelled`); routing strategy (`round-robin`, `load-balanced`, `role-based`, `manual`, `ai-optimized`)

**Referenced by:** Workflow.schema.json

**Validation Notes:** `unevaluatedProperties` is false; dependencies support `blocks`, `blocked-by`, and `related-to` relationship types.
