# WorkflowEvent

**File:** `WorkflowEvent.schema.json`

**Purpose:** Defines workflow-bus events for entity creation, updates, approval outcomes, AI completion, and plugin execution with configurable routing.

**Type:** Standalone Workflow Schema

**Template Source:** `templates/workflow/WorkflowEvent.template.json`

**Required Properties:** events items require `id` and `type`

**Key Enums:** event type (`entityCreated`, `entityUpdated`, `entityDeleted`, `workflowStarted`, `workflowCompleted`, `approvalGranted`, `approvalRejected`, `aiFinished`, `exportCompleted`, `pluginExecuted`); routing mode (`direct`, `fanout`, `topic`, `queue`)

**Referenced by:** Workflow.schema.json

**Validation Notes:** `unevaluatedProperties` is false; each event can define a custom schema with required field lists.
