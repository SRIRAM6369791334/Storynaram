# WorkflowTrigger

**File:** `WorkflowTrigger.template.json`

**Purpose:** Defines what initiates workflow transitions — manual, automatic, AI-driven, time-based, event-based, or rule-based triggers.

**Inputs:** `triggers[]` — each with `id`, `type`, `source`, `condition`, `event`, `cron`, `delay`, `cooldown`, `maxFires`.

**Outputs:** Fires a transition when trigger conditions are met; cooldown prevents rapid re-firing.

**Dependencies:** WorkflowTransition (triggers invoke transitions), WorkflowEvent (event-based triggers), WorkflowSchedule (cron/time-based triggers).

**Relationships:** WorkflowTransition (triggered by), WorkflowCondition (guards whether trigger fires), WorkflowEvent (source for event-based triggers).

**Lifecycle:** Idle → Fired → Cooldown → Idle (up to `maxFires`).

**Future Extensions:** Add composite triggers with AND/OR logic across multiple event sources.
