# AIAnalytics

**File:** `AIAnalytics.schema.json`

**Purpose:** Captures usage, latency, error, cost, and performance metrics across AI model invocations.

**Type:** Standalone AI Runtime Schema

**Template Source:** `templates/ai/AIAnalytics.template.json`

**Required Properties:** none

**Key Enums:** none (numeric metrics and free-form error records)

**Validation Notes:** successRate 0-1; cacheHitRate 0-1; latency percentiles in milliseconds; costs currency string optional.

**Runtime Role:** Aggregates telemetry from AI calls for monitoring, cost tracking, and model performance analysis.

**Cross-References:** AISession, AIConfiguration, AITask, AIWorkflow
