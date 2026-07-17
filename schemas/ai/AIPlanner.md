# AIPlanner

**File:** `AIPlanner.schema.json`

**Purpose:** Goal-driven AI plan with decomposition, resource estimation, dependency mapping, and adaptation.

**Type:** Standalone AI Runtime Schema

**Template Source:** `templates/ai/AIPlanner.template.json`

**Required Properties:** none

**Key Enums:** dependency type (blocks, requires, triggers, optional); adaptation strategy (replan, repair, continue, abort); plan status (draft, approved, inProgress, completed, failed, adapted, cancelled); step status (pending, inProgress, completed, skipped, failed)

**Validation Notes:** priority 0-100; estimatedDuration in numeric units; parentId references subGoal hierarchy.

**Runtime Role:** Decomposes high-level story goals into sub-goals and plan steps with dependency resolution and dynamic adaptation.

**Cross-References:** AIWorkflow, AITask, AIReasoning, AITokenBudget
