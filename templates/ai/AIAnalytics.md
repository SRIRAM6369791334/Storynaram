# AIAnalytics

**File:** `AIAnalytics.template.json`

**Purpose:** Collects AI telemetry — token usage (total, average, peak, per-model), latency percentiles (p50, p95, p99), per-model performance metrics, error tracking with retry resolution, cost estimation per model/task, and aggregate success metrics.

**Inputs:** `tokenUsage` (totalPromptTokens, totalCompletionTokens, byModel), `latency` (averageMs, p50/p95/p99, timeouts), `modelPerformance` (successRate, tokensPerSecond), `errors` (errorType, model, retryAttempted), `costs` (estimatedTotalCost, costPerModel), `metrics`.

**Outputs:** Analytics reports and dashboards for system monitoring, budgeting, and optimization.

**Dependencies:** AISession (per-session token/latency data), AITask (per-task metrics), AIConfiguration (cost model definitions).

**Relationships:** AISession, AITask, AIConfiguration, AITokenBudget, AIWorkflow.

**Validation Rules:** `modelPerformance.successRate` must be 0–1; `latency` values are in milliseconds; `metrics.cacheHitRate` must be 0–1; `costs.currency` is a free-form string (recommended ISO 4217).

**Future Extensions:**
- Add real-time alerting on anomaly detection (spikes in latency/errors).
- Support export to external observability platforms (OpenTelemetry, Datadog).
