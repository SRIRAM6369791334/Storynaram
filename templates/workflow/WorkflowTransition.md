# WorkflowTransition

**File:** `WorkflowTransition.template.json`

**Purpose:** Defines valid state transitions with triggers, guards, and actions to control workflow progression.

**Inputs:** `transitions[]` — each with `id`, `from`, `to`, `type` (manual/automatic/ai-driven/time-based/event-based/rule-based), `label`, `guard`, `action`, `trigger`, `condition`, `autoTransition`, `autoTransitionDelay`.

**Outputs:** `transitionHistory[]` — records of `from`, `to`, `trigger`, `actor`, `timestamp`, `reason`.

**Dependencies:** WorkflowState (from/to states), WorkflowTrigger, WorkflowCondition, WorkflowAction.

**Relationships:** WorkflowState (defines valid endpoints), WorkflowTrigger (initiates transitions), WorkflowCondition (guards), WorkflowAction (invoked on transition).

**Lifecycle:** Transitions move entities between states; history tracks every state change chronologically.

**Future Extensions:** Add parallel transitions and conditional branching with multiple target states.
