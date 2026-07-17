# WorkflowApproval

**File:** `WorkflowApproval.template.json`

**Purpose:** Approval chain definition — single, multi-stage, parallel, sequential, AI, human, and hybrid approval workflows with escalation and voting.

**Inputs:** `type`, `stages[]` (id, name, order, approvers, requiredCount, deadline, escalation), `approvers[]` (id, name, role, type), `deadline`, `escalation`, `voting` (unanimous/majority/super-majority/any/weighted), `autoApprove` conditions.

**Outputs:** `result` — approved / rejected / pending / escalated / expired.

**Dependencies:** Workflow (parent), WorkflowState (requiresApproval states), WorkflowNotification (escalation/rejection notifications).

**Relationships:** WorkflowReview (complementary review process), WorkflowAssignment (approver routing), WorkflowNotification (deadline reminders, escalation alerts).

**Lifecycle:** `pending` → `approved` / `rejected` / `escalated` / `expired`.

**Future Extensions:** Add approval delegation chains and parallel stage merging.
