# WorkflowMetrics

**File:** `WorkflowMetrics.schema.json`

**Purpose:** Configures observability counters, histograms, and gauges for workflow performance tracking with custom metric definitions and export providers.

**Type:** Standalone Workflow Schema

**Template Source:** `templates/workflow/WorkflowMetrics.template.json`

**Required Properties:** none

**Key Enums:** custom metric type (`counter`, `histogram`, `gauge`); export provider (`prometheus`, `datadog`, `grafana`, `cloudwatch`, `custom`)

**Referenced by:** Workflow.schema.json

**Validation Notes:** `unevaluatedProperties` is false on all definitions; all counter/histogram/gauge flags default to `true` except `approvalTime`, `aiLatency`, and `queueWaitTime`.
