# WorkflowCheckpoint

**File:** `WorkflowCheckpoint.template.json`

**Purpose:** Checkpoint and savepoint definitions — full state snapshots with rollback support and metadata for workflow recovery and debugging.

**Inputs:** `checkpoints[]` — each with `id`, `state`, `snapshot`, `timestamp`, `description`, `canRollbackTo`, `metadata`. `checkpointConfig` — `autoCheckpoint`, `interval`, `maxCheckpoints`, `onTransition`, `storage` (memory/file/database/object-store).

**Outputs:** Persistent snapshots of workflow state at specific points in time for recovery.

**Dependencies:** WorkflowRollback (rollback targets checkpoints), WorkflowState (checkpoints capture state), WorkflowConfiguration (storage and recovery settings).

**Relationships:** WorkflowRollback (rolls back to a checkpoint), WorkflowConfiguration (auto-checkpoint settings), WorkflowRetry (retry may use checkpoints).

**Lifecycle:** Created → Stored → Retrieved (on rollback) → Pruned (when maxCheckpoints exceeded).

**Future Extensions:** Add incremental checkpointing to reduce storage overhead for long-running workflows.
