# AITask

**File:** `AITask.schema.json`

**Purpose:** Single AI task with typed input/output, model constraints, timeout, retry logic, and metadata.

**Type:** Standalone AI Runtime Schema

**Template Source:** `templates/ai/AITask.template.json`

**Required Properties:** none

**Key Enums:** type (generation, analysis, classification, extraction, transformation, validation, search, summarization, reasoning, embedding); I/O format (text, json, markdown, structured, binary); backoffStrategy (fixed, exponential, linear, jitter)

**Validation Notes:** timeout minimum 1000ms; maxRetries minimum 0; priority 0-100.

**Runtime Role:** Represents a unit of AI work dispatched to a model, with retry and timeout guarantees.

**Cross-References:** AIWorkflow, AIPlanner, AISession, AIConfiguration
