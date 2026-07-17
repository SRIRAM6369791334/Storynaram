# WorkflowRetry

**File:** `WorkflowRetry.schema.json`

**Purpose:** Configures retry logic for failed workflow steps with exponential backoff, retryable error codes, and final-failure fallback actions.

**Type:** Standalone Workflow Schema

**Template Source:** `templates/workflow/WorkflowRetry.template.json`

**Required Properties:** none

**Key Enums:** onFinalFailure (`abort`, `skip`, `notify`)

**Referenced by:** Workflow.schema.json

**Validation Notes:** `unevaluatedProperties` is false; `maxRetries` defaults to 3; `backoffMultiplier` defaults to 2.0 with a minimum of 1.0; `maxDelay` caps exponential backoff growth.
