# WorkflowTrigger

**File:** `WorkflowTrigger.schema.json`

**Purpose:** Defines workflow triggers — manual, automatic, AI-driven, time-based, event-based, or rule-based — with cooldown and max-fire constraints.

**Type:** Standalone Workflow Schema

**Template Source:** `templates/workflow/WorkflowTrigger.template.json`

**Required Properties:** none

**Key Enums:** type (`manual`, `automatic`, `ai-driven`, `time-based`, `event-based`, `rule-based`)

**Referenced by:** Workflow.schema.json

**Validation Notes:** `unevaluatedProperties` is false; triggers can reference a `condition`, `event`, or `cron` expression; `cooldown` prevents re-firing within a window.
