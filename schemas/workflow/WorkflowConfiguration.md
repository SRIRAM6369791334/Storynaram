# WorkflowConfiguration

**File:** `WorkflowConfiguration.schema.json`

**Purpose:** Central workflow engine configuration including concurrency limits, error handling strategies, logging, and feature flags.

**Type:** Standalone Workflow Schema

**Template Source:** `templates/workflow/WorkflowConfiguration.template.json`

**Required Properties:** none

**Key Enums:** error strategy (`fail-fast`, `continue`, `retry`, `compensate`); logging level (`debug`, `info`, `warn`, `error`); logging destination (`console`, `file`, `database`, `external`)

**Referenced by:** Workflow.schema.json

**Validation Notes:** `unevaluatedProperties` is false; `version` must match semver pattern `^\d+\.\d+\.\d+$`; `timeout` and concurrency values use minimum constraints.
