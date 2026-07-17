# WorkflowAssignment

**File:** `WorkflowAssignment.template.json`

**Purpose:** Task and user assignment — assignee, assigner, role, priority, routing rules, deadline management, and inter-assignment dependencies.

**Inputs:** `assignee` (id, type: user/group/role/ai), `assigner` (id, type: user/system/ai/rule), `role`, `priority` (critical/high/medium/low/backlog), `deadline` (due, reminderBefore), `dependencies[]`, `routing` (strategy, rules, allowReassignment).

**Outputs:** `status` — pending / assigned / in-progress / completed / blocked / deferred / cancelled.

**Dependencies:** Workflow (parent), WorkflowNotification (deadline reminders), WorkflowApproval (approver assignments), WorkflowReview (reviewer assignments).

**Relationships:** WorkflowApproval (approver routing), WorkflowReview (reviewer routing), WorkflowQueue (queued assignments), WorkflowNotification (assignment alerts).

**Lifecycle:** `pending` → `assigned` → `in-progress` → `completed`. Supports `blocked`, `deferred`, `cancelled`.

**Future Extensions:** Add AI-optimized auto-assignment based on workload and skill matching.
