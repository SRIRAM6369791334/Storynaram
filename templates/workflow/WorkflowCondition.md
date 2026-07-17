# WorkflowCondition

**File:** `WorkflowCondition.template.json`

**Purpose:** Guard conditions, pre-conditions, post-conditions, and invariant rules that control whether workflow transitions and actions execute.

**Inputs:** `conditions[]` — each with `id`, `type` (field/status/relationship/time/permission/ai/custom), `expression`, `field`, `operator`, `value`, `failMessage`, `severity` (error/warning/info). `evaluationMode` (all/any/sequence).

**Outputs:** Boolean evaluation result; on failure emits `failMessage` at specified `severity`.

**Dependencies:** WorkflowTransition (guards), WorkflowTrigger (condition evaluation), WorkflowAction (pre/post conditions).

**Relationships:** WorkflowTransition (referenced as guard), WorkflowTrigger (condition to fire), WorkflowAction (conditional execution).

**Lifecycle:** Evaluated each time a transition or action is attempted; no persistent state.

**Future Extensions:** Add nested condition groups with composite logical operators.
