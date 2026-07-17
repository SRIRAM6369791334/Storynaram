# AIReasoning

**File:** `AIReasoning.template.json`

**Purpose:** Orchestrates reasoning execution — supports six modes (direct, chain-of-thought, tree-of-thought, reAct, reflexion, plan-and-execute) with verification, consistency checking, and conflict detection.

**Inputs:** `mode`, `steps` (plan, reason, verify, search, recall, conclude), `verification` (strategy, maxRetries), `consistencyCheck`, `conflictDetection` (resolution).

**Outputs:** Step-by-step reasoning trace with per-step input, output, token count, and final conclusion.

**Dependencies:** AIPrompt (prompt construction), AIRetrieval (search/recall steps), AICanon (consistency checking).

**Relationships:** AIPrompt, AIRetrieval, AICanon, AIValidation, AIPlanner.

**Validation Rules:** `mode` must be one of the six supported types; `verification.maxRetries` defaults to 2; `conflictDetection.resolution` must be `auto-resolve`, `flag`, or `reject`.

**Future Extensions:**
- Add multi-agent debate reasoning mode.
- Support streaming reasoning output for real-time applications.
