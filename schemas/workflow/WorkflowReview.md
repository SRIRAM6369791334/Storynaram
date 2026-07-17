# WorkflowReview

**File:** `WorkflowReview.schema.json`

**Purpose:** Manages peer, editorial, technical, or AI review cycles with scoring criteria, weighted decisions, comments, and deadline enforcement.

**Type:** Standalone Workflow Schema

**Template Source:** `templates/workflow/WorkflowReview.template.json`

**Required Properties:** none

**Key Enums:** type (`peer`, `editorial`, `technical`, `ai`); decision (`approved`, `changes-requested`, `rejected`, `abstained`); aggregateMethod (`average`, `weighted`, `median`, `lowest`, `highest`); actionOnExpiry (`auto-approve`, `escalate`, `fail`, `notify`)

**Referenced by:** Workflow.schema.json

**Validation Notes:** `unevaluatedProperties` is false; scoring is optional with configurable min/max scale and pass threshold.
