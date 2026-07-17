# WorkflowEvent

**File:** `WorkflowEvent.template.json`

**Purpose:** Typed domain events with producer/consumer metadata, JSON schema validation, and routing configuration for event-driven workflow behavior.

**Inputs:** `events[]` — each with `id`, `type` (entityCreated/entityUpdated/entityDeleted/workflowStarted/workflowCompleted/approvalGranted/approvalRejected/aiFinished/exportCompleted/pluginExecuted), `producer`, `schema`, `routing` (mode, consumers, priority).

**Outputs:** Emitted events consumed by registered subscribers based on routing mode (direct/fanout/topic/queue).

**Dependencies:** WorkflowTrigger (event-based triggers listen to events), WorkflowNotification (events can trigger notifications), WorkflowAction (events invoke actions).

**Relationships:** WorkflowTrigger (event-based triggers consume events), WorkflowAudit (events are recorded in audit trail), WorkflowMetrics (events feed counters/histograms).

**Lifecycle:** Produced → Routed → Consumed. Failed deliveries follow queue retry policy.

**Future Extensions:** Add event replay and event sourcing for complete workflow reconstruction.
