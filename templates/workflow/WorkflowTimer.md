# WorkflowTimer

**File:** `WorkflowTimer.template.json`

**Purpose:** Timer definitions — delay, interval, cron, and timeout timers with repeat control and fire/expire action bindings.

**Inputs:** `timers[]` — each with `id`, `type` (delay/interval/cron/timeout), `duration`, `repeat`, `maxFires`, `onFire` (action, params), `onExpire` (action, params).

**Outputs:** On fire: executes bound action with params. On expire: executes expiry action. Supports single-fire and repeating timers.

**Dependencies:** WorkflowAction (fire/expire actions), WorkflowSchedule (cron timer type), WorkflowState (state timeout uses timers).

**Relationships:** WorkflowSchedule (cron-based timers), WorkflowAction (actions executed on fire/expire), WorkflowState (timeout per state), WorkflowTrigger (time-based triggers).

**Lifecycle:** Created → Running → Fired (repeatable) → Expired / Max Fires Reached / Cancelled.

**Future Extensions:** Add timer persistence across system restarts and distributed timer coordination.
