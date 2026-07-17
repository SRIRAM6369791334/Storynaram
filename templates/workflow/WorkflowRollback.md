# WorkflowRollback

**File:** `WorkflowRollback.template.json`

**Purpose:** Rollback strategy definition — checkpoint-based and compensating rollback with undo actions, data restore, and rollback notifications.

**Inputs:** `enabled`, `rollbackTo` (checkpoint ID), `strategy` (sequential/snapshot/compensating), `undoActions[]` (actionId, type, order, compensatingAction, params), `dataRestore` (restoreEntities, restoreState, excludeFields, backupLocation), `notification`.

**Outputs:** Restored workflow state and entity data to the target checkpoint; compensating actions executed in reverse order.

**Dependencies:** WorkflowCheckpoint (rollback targets), WorkflowState (states to restore), WorkflowAction (undo/compensating actions).

**Relationships:** WorkflowCheckpoint (rolls back to saved snapshots), WorkflowAction (compensating actions undo previous work), WorkflowNotification (alerts on rollback).

**Lifecycle:** Initiated → Undo Actions (reverse order) → Data Restore → Notification → Completed.

**Future Extensions:** Add partial rollback support for selective state restoration.
