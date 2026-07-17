# WorkflowRetry

**File:** `WorkflowRetry.template.json`

**Purpose:** Retry policy with exponential backoff — configurable max retries, retryable error codes, and final failure handling strategy.

**Inputs:** `enabled`, `maxRetries`, `retryDelay`, `backoffMultiplier`, `maxDelay`, `retryableErrors[]` (code, message), `onFinalFailure` (abort/skip/notify).

**Outputs:** On success: completed action. On final failure: follows `onFinalFailure` strategy with all errors recorded.

**Dependencies:** WorkflowAction (retries failed actions), WorkflowQueue (queue retry with dead-letter), WorkflowConfiguration (global retry defaults).

**Relationships:** WorkflowAction (applies retry policy to actions), WorkflowQueue (DLQ after max retries), WorkflowMetrics (counts retries and failures).

**Lifecycle:** Attempt → Failed → Wait (backoff) → Retry → ... → Success / Final Failure.

**Future Extensions:** Add circuit breaker pattern integration and jitter for backoff randomization.
