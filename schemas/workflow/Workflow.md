# Workflow

**File:** `Workflow.schema.json`

**Purpose:** Root workflow definition orchestrating states, transitions, triggers, conditions, actions, and lifecycle for any entity process.

**Type:** Standalone Workflow Schema

**Template Source:** `templates/workflow/Workflow.template.json`

**Required Properties:** `workflowId`, `name`, `type`, `entityType`

**Key Enums:** type (`lifecycle`, `approval`, `review`, `publishing`, `ai-generation`, `ai-review`, `import`, `export`, `translation`, `version-control`, `archive`, `deletion`, `recovery`, `plugin`, `custom`); status (`active`, `paused`, `completed`, `failed`, `cancelled`)

**Referenced by:** none

**Validation Notes:** `unevaluatedProperties` is false — no extra properties allowed beyond the defined refs.
