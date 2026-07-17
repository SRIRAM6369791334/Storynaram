# Workflow

**File:** `Workflow.template.json`

**Purpose:** Root workflow definition that orchestrates states, transitions, triggers, conditions, actions, and lifecycle for any entity process.

**Inputs:** `workflowId`, `name`, `description`, `type` (lifecycle/approval/review/publishing/ai-generation/import/export/etc.), `entityType`.

**Outputs:** `status` (active/paused/completed/failed/cancelled), `currentState` — the currently active workflow state.

**Dependencies:** All sub-templates: WorkflowState, WorkflowTransition, WorkflowTrigger, WorkflowCondition, WorkflowAction, WorkflowApproval, WorkflowReview, WorkflowAssignment, WorkflowNotification, WorkflowEvent, WorkflowCheckpoint, WorkflowRollback, WorkflowRetry, WorkflowSchedule, WorkflowTimer, WorkflowQueue, WorkflowAudit, WorkflowMetrics, WorkflowConfiguration.

**Relationships:** Parent orchestrator for every other workflow template.

**Lifecycle:** `active` → `paused` / `completed` / `failed` / `cancelled`.

**Future Extensions:** Add support for nested sub-workflows and parallel workflow branching.
