# BaseAI

**File:** `BaseAI.schema.json`

**Purpose:** AI metadata and retrieval configuration — visibility, embeddings, RAG context priority, canonical importance, search keywords, AI notes, and prompt overrides.

**Referenced Template:** `templates/base/BaseAI.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** none

**Key Constraints:** `contentVisibility` enum: `visible`, `hidden`, `summary-only`, `embedding-only`. `embedding.dimensions` is integer. `retrieval.contextPriority` 0–100. `retrieval.weight` 0–1. `canon.importance` 0–100. `canon.locked` defaults false. `keywords[].weight` 0–1.

**Validation Notes:** `canon.locked` prevents AI modification. `contentVisibility` controls AI-level access granularity. Prompt overrides customize AI behavior per entity.

**Backward Compatibility:** Adding new visibility levels is additive. All sections are optional.
