# WorkflowTimer

**File:** `WorkflowTimer.schema.json`

**Purpose:** Defines delay, interval, cron, and timeout timers that fire actions or expire with configurable repeat and max-fire limits.

**Type:** Standalone Workflow Schema

**Template Source:** `templates/workflow/WorkflowTimer.template.json`

**Required Properties:** none

**Key Enums:** type (`delay`, `interval`, `cron`, `timeout`)

**Referenced by:** Workflow.schema.json

**Validation Notes:** `unevaluatedProperties` is false on all definitions; each timer specifies `onFire` and `onExpire` action handlers; `repeat` defaults to false.
