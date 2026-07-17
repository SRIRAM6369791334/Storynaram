# AIEmbedding

**File:** `AIEmbedding.template.json`

**Purpose:** Defines embedding metadata — model, dimensions (64–8192), chunk strategy (`document`, `chunk`, `field`, `sentence`, `hybrid`), refresh policy, and index status.

**Inputs:** `modelName`, `modelVersion`, `dimensions`, `strategy`, `chunkConfig` (`maxTokens`, `overlapTokens`), `fields`, `refreshPolicy`.

**Outputs:** Vector references (`vectorId`), index status (`pending`, `indexed`, `failed`, `stale`), last indexed timestamp.

**Dependencies:** External embedding model provider; AIReference (sources for embedding).

**Relationships:** AIRetrieval, AISearch, AIRanking, AIReference.

**Validation Rules:** `dimensions` must be between 64 and 8192; `embeddingVersion` must follow semver pattern; `chunkConfig.maxTokens` defaults to 512.

**Future Extensions:**
- Support multi-vector embeddings per document.
- Add incremental indexing strategies for large corpora.
