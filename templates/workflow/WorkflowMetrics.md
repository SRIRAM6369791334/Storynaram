# WorkflowMetrics

**File:** `WorkflowMetrics.template.json`

**Purpose:** Performance metrics collection — counters, histograms, gauges, and custom metrics for workflow monitoring, observability, and export to external providers.

**Inputs:** `enabled`, `counters` (transitions, retries, failures, approvals, rejections, timeouts), `histograms` (duration, approvalTime, aiLatency, queueWaitTime, actionExecutionTime), `gauges` (activeWorkflows, queuedTasks, concurrentExecutions, successRate), `custom` (labels, metrics[] with name/type/description/tags), `export` (provider, endpoint, interval).

**Outputs:** Collected metrics available via API or exported to Prometheus, Datadog, Grafana, CloudWatch, or custom endpoints.

**Dependencies:** WorkflowConfiguration (feature flags), WorkflowEvent (metrics feed from events), WorkflowAudit (some metrics derived from audit).

**Relationships:** WorkflowEvent (consumed by metrics), WorkflowConfiguration (enables/disables metric collection), WorkflowQueue (queue metrics collected), WorkflowAudit (audit-derived metrics).

**Lifecycle:** Collected → Aggregated → Stored → Exported (per interval). No explicit state transitions — continuous collection.

**Future Extensions:** Add real-time alerting rules based on metric thresholds and anomaly detection.
