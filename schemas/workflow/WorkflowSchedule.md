# WorkflowSchedule

**File:** `WorkflowSchedule.schema.json`

**Purpose:** Schedules recurring or one-time workflow execution via cron expressions with timezone, date range, holiday skipping, and constraint filters.

**Type:** Standalone Workflow Schema

**Template Source:** `templates/workflow/WorkflowSchedule.template.json`

**Required Properties:** none

**Key Enums:** constraint type (`day-of-week`, `day-of-month`, `time-range`, `holiday`)

**Referenced by:** Workflow.schema.json

**Validation Notes:** `unevaluatedProperties` is false; `maxExecutions` of 0 means unlimited; timezone defaults to `UTC`; `skipHolidays` defaults to false.
