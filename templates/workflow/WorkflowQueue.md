# WorkflowQueue

**File:** `WorkflowQueue.template.json`

**Purpose:** Queue configuration — priority, FIFO, and delayed queues with concurrency controls, size limits, retry policies, and dead-letter queue support.

**Inputs:** `queueName`, `type` (priority/fifo/delayed), `concurrency`, `maxSize`, `retry` (maxRetries, backoff, delay), `deadLetterQueue` (enabled, name, maxDeliveries), `priorityLevels[]` (level, label, weight).

**Outputs:** Items dequeued in order (priority/FIFO); failed items sent to dead-letter queue after max deliveries exhausted.

**Dependencies:** WorkflowAction (actions may be queued), WorkflowRetry (queue retry policy), WorkflowConfiguration (concurrency settings).

**Relationships:** WorkflowAction (queued for async execution), WorkflowRetry (retry on failure), WorkflowMetrics (queue wait time, queued tasks gauge), WorkflowConfiguration (global concurrency limits).

**Lifecycle:** Enqueued → Waiting → Dequeued → Processing → Completed / Failed → DLQ (after retries).

**Future Extensions:** Add queue partitioning and consumer group support for horizontal scaling.
