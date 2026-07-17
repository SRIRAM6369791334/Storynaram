# WorkflowAction

**File:** `WorkflowAction.template.json`

**Purpose:** Action definitions invoked on state entry, state exit, and during transitions — system, notification, AI, validation, export, import, transform, webhook, plugin, or custom.

**Inputs:** `actions[]` — each with `id`, `type`, `name`, `config`, `order`, `async`, `timeout`, `onFailure` (abort/skip/retry/continue).

**Outputs:** Side effects determined by action type (e.g., transformed data, sent notification, exported file).

**Dependencies:** WorkflowState (entry/exit actions), WorkflowTransition (transition actions), WorkflowNotification (notification actions).

**Relationships:** WorkflowState (bound to entry/exit), WorkflowTransition (invoked during transition), WorkflowRetry (retry policy on failure).

**Lifecycle:** Queued → Running → Completed / Failed. Failed actions follow `onFailure` strategy.

**Future Extensions:** Add action chains with conditional branching and parallel execution groups.
