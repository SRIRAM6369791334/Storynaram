# AIWorkflow

**File:** `AIWorkflow.template.json`

**Purpose:** Orchestrates multi-stage AI workflows — stage definitions (sequential/parallel/conditional/loop), step definitions (generate/analyze/transform/validate/retrieve/score/route), model routing, fallback policies, and parallel execution with merge strategies.

**Inputs:** `workflowId`, `stages` (type, condition), `steps` (inputMapping, outputMapping), `modelRouting` (strategy, assignments), `fallback` (maxRetries, retryDelay, onFailure), `parallel` (maxConcurrency, mergeStrategy).

**Outputs:** Workflow execution `status` (pending, running, paused, completed, failed, cancelled) and per-step results.

**Dependencies:** AITask (individual task execution), AIModel (model routing), AIPlanner (workflow planning).

**Relationships:** AITask, AIPlanner, AIReasoning, AISession, AIAnalytics.

**Validation Rules:** `stage.type` must be one of the four supported types; `step.type` must be one of the seven supported types; `fallback.onFailure` must be `retry`, `skip`, `abort`, `fallbackModel`, or `useCache`.

**Future Extensions:**
- Add visual workflow builder integration.
- Support dynamic workflow branching based on intermediate results.
