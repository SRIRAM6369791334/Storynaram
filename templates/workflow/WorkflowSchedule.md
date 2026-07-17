# WorkflowSchedule

**File:** `WorkflowSchedule.template.json`

**Purpose:** Cron-based scheduling with timezone support, date constraints, holiday skipping, and execution limits for recurring workflow execution.

**Inputs:** `enabled`, `cron`, `timezone`, `startDate`, `endDate`, `maxExecutions`, `skipHolidays`, `constraints[]` (type: day-of-week/day-of-month/time-range/holiday, values).

**Outputs:** Scheduled workflow executions triggered per cron expression; skipped on holidays or constrained dates if configured.

**Dependencies:** WorkflowTimer (fires scheduled events), WorkflowTrigger (time-based triggers), WorkflowConfiguration (feature flags for scheduling).

**Relationships:** WorkflowTrigger (time-based triggers use schedule), WorkflowTimer (cron timers), WorkflowQueue (scheduled items queued for execution).

**Lifecycle:** Registered → Waiting → Executing → Completed / Max Executions Reached / Expired.

**Future Extensions:** Add calendar-based scheduling with custom holiday definitions and time windows.
