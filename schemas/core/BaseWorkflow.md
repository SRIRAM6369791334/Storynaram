# BaseWorkflow

**File:** `BaseWorkflow.schema.json`

**Purpose:** Workflow configuration block — state machines, approval workflows, automation rules, pipeline stages, and task assignments.

**Referenced Template:** `templates/base/BaseWorkflow.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** none

**Key Constraints:** `workflows[].stages` are ordered arrays with optional `timeout` (hours). `assignments[].status` enum: `pending`, `in-progress`, `completed`, `blocked`. `automation.enabled` defaults false. `automation.rules` define event-condition-action tuples. `triggers` fire on events with optional conditions.

**Validation Notes:** Stage ordering is implicit by array position. Timeout is in hours. Automation rules support complex event-driven behavior.

**Backward Compatibility:** Adding new status values for assignments is additive. All sections are optional.
