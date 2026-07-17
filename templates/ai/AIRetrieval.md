# AIRetrieval

**File:** `AIRetrieval.template.json`

**Purpose:** Configures multi-strategy retrieval — keyword, semantic, hybrid, graph, timeline, relationship, canon, and memory — for fetching relevant information.

**Inputs:** Search query context, retrieval strategy flags, `minScore` thresholds, `maxResults` limits, graph traversal depth, timeline ranges.

**Outputs:** Ranked result sets from each enabled strategy, merged into a unified retrieval payload.

**Dependencies:** AIEmbedding (semantic model), AIMemory (memory retrieval), AICanon (canon retrieval).

**Relationships:** AIEmbedding, AIMemory, AICanon, AISearch, AIRanking.

**Validation Rules:** `hybrid.fullTextWeight` + `semanticWeight` must sum to ≤ 1.0; `graph.traversalDepth` capped at 5.

**Future Extensions:**
- Support cross-modal retrieval (text-to-image, text-to-audio).
- Add retrieval-augmented generation (RAG) caching layer.
