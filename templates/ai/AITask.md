# AITask

**File:** `AITask.template.json`

**Purpose:** Defines individual AI tasks — typed (generation, analysis, classification, extraction, transformation, validation, search, summarization, reasoning, embedding) with input/output schemas, model requirements, timeout, and retry policies.

**Inputs:** `taskId`, `type`, `input` (format, schema, maxInputTokens), `output` (format, schema, maxOutputTokens), `model` (modelId, capabilities, minTokens), `timeout`, `retry` (maxRetries, backoffStrategy, retryableErrors).

**Outputs:** Task results matching the output schema with metadata (priority, tags, sessionId, workflowId).

**Dependencies:** AISession (session context), AIWorkflow (workflow parent), AIReasoning (reasoning tasks), AIEmbedding (embedding tasks).

**Relationships:** AIWorkflow, AISession, AIReasoning, AIEmbedding, AIAnalytics.

**Validation Rules:** `type` must be one of the ten enumerated types; `timeout` must be ≥ 1000ms; `retry.backoffStrategy` must be `fixed`, `exponential`, `linear`, or `jitter`; `retry.maxRetries` must be ≥ 0.

**Future Extensions:**
- Add task queuing and priority scheduling.
- Support distributed task execution across multiple workers.
