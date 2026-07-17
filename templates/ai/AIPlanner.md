# AIPlanner

**File:** `AIPlanner.template.json`

**Purpose:** Decomposes high-level goals into hierarchical sub-goals with ordered plan steps, resource estimation (tokens, calls, time, budget), dependency ordering, and dynamic plan adaptation.

**Inputs:** `goal`, `decomposition` (sub-goals with priority and completionCriteria), `plan` (actions with expectedDuration), `resources` (estimatedTokens, estimatedCalls, requiredModels), `dependencies` (blocks, requires, triggers, optional), `adaptation` (strategy, maxRevisions).

**Outputs:** Plan execution `status` (draft, approved, inProgress, completed, failed, adapted, cancelled) and adapted plan revisions.

**Dependencies:** AIWorkflow (plan execution), AIReasoning (plan verification), AITokenBudget (resource estimation).

**Relationships:** AIWorkflow, AIReasoning, AITokenBudget, AITask, AIContext.

**Validation Rules:** `decomposition.priority` must be 0–100; `adaptation.strategy` must be one of `replan`, `repair`, `continue`, `abort`; `status` transitions are enforced (e.g., cannot go from completed to inProgress).

**Future Extensions:**
- Add automated plan optimization using historical execution data.
- Support parallel sub-goal planning and execution.
