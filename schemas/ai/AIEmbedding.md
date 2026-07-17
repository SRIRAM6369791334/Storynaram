# AIEmbedding

**File:** `AIEmbedding.schema.json`

**Purpose:** Configuration and metadata for vector embedding generation and indexing.

**Type:** Standalone AI Runtime Schema

**Template Source:** `templates/ai/AIEmbedding.template.json`

**Required Properties:** none

**Key Enums:** strategy (document, chunk, field, sentence, hybrid); refreshPolicy (on-write, scheduled, manual, never); indexStatus (pending, indexed, failed, stale)

**Validation Notes:** dimensions must be between 64 and 8192; embeddingVersion uses semver pattern.

**Runtime Role:** Governs how text is vectorized, chunked, and indexed for semantic retrieval.

**Cross-References:** AIRetrieval, AISearch, AIRanking, AITokenBudget
