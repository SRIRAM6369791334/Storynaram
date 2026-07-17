# AIWorkflow

**File:** `AIWorkflow.schema.json`

**Purpose:** Multi-stage AI workflow with model routing, fallback, and parallel execution support.

**Type:** Standalone AI Runtime Schema

**Template Source:** `templates/ai/AIWorkflow.template.json`

**Required Properties:** none

**Key Enums:** stage type (sequential, parallel, conditional, loop); step type (generate, analyze, transform, validate, retrieve, score, route); model routing strategy (fixed, roundRobin, leastLoaded, capability, costOptimized); workflow status (pending, running, paused, completed, failed, cancelled); onFailure (retry, skip, abort, fallbackModel, useCache); mergeStrategy (serial, weighted, vote, concat, first)

**Validation Notes:** stages ordered by `order` field; inputMapping/outputMapping are key-value string maps.

**Runtime Role:** Orchestrates complex multi-step AI pipelines with configurable routing, parallel branches, and failure handling.

**Cross-References:** AIPlanner, AITask, AIConfiguration, AISession
