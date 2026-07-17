# WorkflowQueue

**File:** `WorkflowQueue.schema.json`

**Purpose:** Configures priority, FIFO, or delayed queues for workflow task execution with retry and dead-letter handling.

**Type:** Standalone Workflow Schema

**Template Source:** `templates/workflow/WorkflowQueue.template.json`

**Required Properties:** none

**Key Enums:** type (`priority`, `fifo`, `delayed`); backoff (`fixed`, `exponential`, `linear`)

**Referenced by:** Workflow.schema.json

**Validation Notes:** `unevaluatedProperties` is false; `concurrency` defaults to 1 with a minimum of 1; dead-letter queue routing is optional.
