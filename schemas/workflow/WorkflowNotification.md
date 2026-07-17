# WorkflowNotification

**File:** `WorkflowNotification.schema.json`

**Purpose:** Manages multi-channel notifications (email, Slack, in-app, webhook) triggered by workflow events with templating and throttling.

**Type:** Standalone Workflow Schema

**Template Source:** `templates/workflow/WorkflowNotification.template.json`

**Required Properties:** none

**Key Enums:** channel (`email`, `slack`, `in-app`, `webhook`); recipient type (`user`, `group`, `role`, `external`)

**Referenced by:** Workflow.schema.json

**Validation Notes:** `unevaluatedProperties` is false; throttling supports per-minute, per-hour, cooldown, and aggregation controls.
