# AIReasoning

**File:** `AIReasoning.schema.json`

**Purpose:** Multi-step reasoning configuration with verification and consistency checking.

**Type:** Standalone AI Runtime Schema

**Template Source:** `templates/ai/AIReasoning.template.json`

**Required Properties:** none

**Key Enums:** mode (direct, chain-of-thought, tree-of-thought, reAct, reflexion, plan-and-execute); step type (plan, reason, verify, search, recall, conclude); verification strategy (self-verify, cross-verify, external); conflict resolution (auto-resolve, flag, reject)

**Validation Notes:** steps are ordered; tokens recorded per step; maxRetries defaults to 2.

**Runtime Role:** Orchestrates the AI's reasoning process, tracking each step and verifying outputs for consistency.

**Cross-References:** AIValidation, AICanon, AIPlanner, AIWorkflow
